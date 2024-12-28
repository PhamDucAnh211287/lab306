import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, get, onValue, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Function to fetch and display reports for the selected time range
function fetchReports(timeRange) {
    const reportsRef = ref(database, `workReports/${timeRange}`);
    onValue(reportsRef, (snapshot) => {
        const reportsTableBody = document.getElementById('reportsTable').getElementsByTagName('tbody')[0];
        reportsTableBody.innerHTML = ''; // Clear existing data

        if (snapshot.exists()) {
            const reports = snapshot.val();
            for (const key in reports) {
                if (reports.hasOwnProperty(key)) {
                    const report = reports[key];
                    const row = reportsTableBody.insertRow();
                    row.insertCell(0).innerText = report.userName;
                    row.insertCell(1).innerText = report.startDate;
                    row.insertCell(2).innerText = report.endDate;
                    row.insertCell(3).innerText = report.reportContent;

                    const commentCell = row.insertCell(4);
                    const commentInput = document.createElement('textarea');
                    commentInput.value = report.comment || '';
                    commentInput.rows = 3;
                    commentInput.style.width = '100%';
                    commentInput.dataset.reportId = key; // Store report ID in data attribute
                    commentCell.appendChild(commentInput);
                }
            }
        } else {
            console.log("No data available");
        }
    }, (error) => {
        console.error("Error fetching data: ", error);
    });
}

// Function to save all comments
window.saveAllComments = function() {
    const timeRange = document.getElementById('timeRangeSelect').value;
    const comments = document.querySelectorAll('textarea[data-report-id]');
    const updates = {};

    comments.forEach(comment => {
        const reportId = comment.dataset.reportId;
        updates[`workReports/${timeRange}/${reportId}/comment`] = comment.value;
    });

    update(ref(database), updates)
        .then(() => {
            alert('Tất cả nhận xét đã được lưu.');
        })
        .catch((error) => {
            console.error("Error saving comments: ", error);
            alert('Không thể lưu nhận xét. Vui lòng thử lại.');
        });
}

// Function to initialize the time range dropdown
function initializeTimeRangeDropdown() {
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    const currentTimeRange = getCurrentTimeRange();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const weeksInCurrentMonth = getWeeksInMonth(currentYear, currentMonth);
    const weeksInNextMonth = getWeeksInMonth(currentYear, currentMonth + 1);

    const allWeeks = [...weeksInCurrentMonth, ...weeksInNextMonth];

    allWeeks.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.text = week;
        if (option.value === currentTimeRange) {
            option.selected = true;
        }
        timeRangeSelect.appendChild(option);
    });

    timeRangeSelect.addEventListener('change', (event) => {
        fetchReports(event.target.value);
    });
}

// Function to get the current time range
function getCurrentTimeRange() {
    const currentDate = new Date();
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = getEndOfWeek(currentDate);
    return formatDateRange(startOfWeek, endOfWeek);
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

    return weeks;
}

// Function to format a date range as "từ Thứ 2 ngày..../tháng - Chủ nhật ngày..../tháng..."
function formatDateRange(startDate, endDate) {
    const options = { day: '2-digit', month: '2-digit' };
    const start = startDate.toLocaleDateString('vi-VN', options);
    const end = endDate.toLocaleDateString('vi-VN', options);
    return `Thứ 2 ngày ${start} - Chủ nhật ngày ${end}`;
}

// Initialize the time range dropdown and fetch reports on page load
window.onload = function() {
    initializeTimeRangeDropdown();
    fetchReports(getCurrentTimeRange());
};