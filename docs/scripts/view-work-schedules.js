import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, get, onValue, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB36iWc4ImymK_uyueW8slGaTOpEJL5OsI",
    authDomain: "lab306-1d0ee.firebaseapp.com",
    databaseURL: "https://lab306-1d0ee-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "lab306-1d0ee",
    storageBucket: "lab306-1d0ee.appspot.com",
    messagingSenderId: "847796891603",
    appId: "1:847796891603:web:51ec0aa97d2e7a7a7e4926",
    measurementId: "G-KVZ51Y77HV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const companyEmployees = [
    "Đạt (K66)",
    "Ly (K66)",
    "Giang (K66)",
    "Tươi (K66)",
    "Tấn (K66)",
    "Trà Giang (K67)",
    "Ánh (K68)",
    "Nga (K65)",
    "Chiến (K66)",
    "Phương Anh (K66)",
    "Quỳnh (K66)",
    "Thảo Anh (K67)",
    "Vĩnh (K67)",
    "Dương (K67)",
    "Nấm Linh Chi (K68)",
    "Đức Anh (K66)",
    "Chi (K66)",
    "Như (K65)",
    "Thảo (K65)",
    "Minh Anh nhỏ (K66)",
    "Dạ Hiền (K67)",
    "Ngọc (K67)",
    "Hiếu (K66)"
    // Thêm các tên khác vào đây
];

// Function to initialize the table with all employees
function initializeTable() {
    const workSchedulesTableBody = document.getElementById('workSchedulesTable').getElementsByTagName('tbody')[0];
    workSchedulesTableBody.innerHTML = ''; // Clear existing data

    companyEmployees.forEach(employee => {
        const row = workSchedulesTableBody.insertRow();
        row.insertCell(0).innerText = employee;
        for (let i = 1; i <= 7; i++) {
            row.insertCell(i).innerText = '';
        }
    });
}

// Function to fetch and display work schedules for the selected time range
function fetchWorkSchedules(timeRange) {
    const workSchedulesRef = ref(database, `workSchedules/${timeRange}`);
    onValue(workSchedulesRef, (snapshot) => {
        if (snapshot.exists()) {
            const workSchedules = snapshot.val();
            const workSchedulesTableBody = document.getElementById('workSchedulesTable').getElementsByTagName('tbody')[0];

            for (const key in workSchedules) {
                if (workSchedules.hasOwnProperty(key)) {
                    const schedule = workSchedules[key];
                    const row = Array.from(workSchedulesTableBody.rows).find(row => row.cells[0].innerText === schedule.userName);
                    if (row) {
                        row.cells[1].innerText = schedule.schedule['Thứ 2'];
                        row.cells[2].innerText = schedule.schedule['Thứ 3'];
                        row.cells[3].innerText = schedule.schedule['Thứ 4'];
                        row.cells[4].innerText = schedule.schedule['Thứ 5'];
                        row.cells[5].innerText = schedule.schedule['Thứ 6'];
                        row.cells[6].innerText = schedule.schedule['Thứ 7'];
                        row.cells[7].innerText = schedule.schedule['Chủ Nhật'];
                    }
                }
            }
        } else {
            console.log("No data available");
        }
    }, (error) => {
        console.error("Error fetching data: ", error);
    });
}

// Function to initialize the time range dropdown
function initializeTimeRangeDropdown() {
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const weeksInCurrentMonth = getWeeksInMonth(currentYear, currentMonth);
    const weeksInNextMonth = getWeeksInMonth(currentYear, currentMonth + 1);

    const allWeeks = [...weeksInCurrentMonth, ...weeksInNextMonth];

    // Sử dụng Set để loại bỏ các tuần trùng lặp
    const uniqueWeeks = Array.from(new Set(allWeeks));

    uniqueWeeks.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.text = `${week}`;
        timeRangeSelect.appendChild(option);
    });

    timeRangeSelect.addEventListener('change', (event) => {
        initializeTable();
        fetchWorkSchedules(event.target.value);
    });
}

// Function to get the start of the week for a given date
function getStartOfWeek(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    return startOfWeek;
}

// Function to get the end of the week for a given date
function getEndOfWeek(date) {
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() - date.getDay() + 7);
    return endOfWeek;
}

// Function to get the weeks in a given month
function getWeeksInMonth(year, month) {
    const weeks = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let currentDate = firstDayOfMonth;
    while (currentDate <= lastDayOfMonth) {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = getEndOfWeek(currentDate);
        weeks.push(formatDateRange(startOfWeek, endOfWeek));
        currentDate.setDate(currentDate.getDate() + 7);
    }

    // Kiểm tra và loại bỏ tuần trùng lặp
    const uniqueWeeks = [];
    weeks.forEach(week => {
        if (!uniqueWeeks.includes(week)) {
            uniqueWeeks.push(week);
        }
    });

    return uniqueWeeks;
}

// Function to format a date range as "từ Thứ 2 ngày..../tháng - Chủ nhật ngày..../tháng..."
function formatDateRange(startDate, endDate) {
    const options = { day: '2-digit', month: '2-digit' };
    const start = startDate.toLocaleDateString('vi-VN', options);
    const end = endDate.toLocaleDateString('vi-VN', options);
    return `từ Thứ 2 ngày ${start} - Chủ nhật ngày ${end}`;
}

// Initialize the table and fetch work schedules on page load
window.onload = function() {
    initializeTable();
    initializeTimeRangeDropdown();
    fetchWorkSchedules(getCurrentTimeRange());
};

// Function to get the current time range
function getCurrentTimeRange() {
    const currentDate = new Date();
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = getEndOfWeek(currentDate);
    return formatDateRange(startOfWeek, endOfWeek);
}