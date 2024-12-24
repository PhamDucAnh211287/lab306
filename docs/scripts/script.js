import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', function() {
    const reportWorkBtn = document.getElementById('reportWorkBtn');
    const registerWorkBtn = document.getElementById('registerWorkBtn');
    const reportWorkForm = document.getElementById('reportWorkForm');
    const registerWorkForm = document.getElementById('registerWorkForm');
    const registerUserNameSelect = document.getElementById('registerUserName');

    // Điền danh sách nhân viên vào dropdown
    companyEmployees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee;
        option.text = employee;
        registerUserNameSelect.appendChild(option);
    });

    reportWorkBtn.addEventListener('click', () => {
        reportWorkForm.style.display = 'block';
        registerWorkForm.style.display = 'none';
    });

    registerWorkBtn.addEventListener('click', () => {
        reportWorkForm.style.display = 'none';
        registerWorkForm.style.display = 'block';
    });
});

window.submitWorkReportForm = function() {
    const reportUserName = document.getElementById('reportUserName').value;
    const reportStartDate = document.getElementById('reportStartDate').value;
    const reportEndDate = document.getElementById('reportEndDate').value;
    const reportContent = document.getElementById('reportContent').value;

    if (reportUserName && reportStartDate && reportEndDate && reportContent) {
        const data = {
            userName: reportUserName,
            startDate: reportStartDate,
            endDate: reportEndDate,
            reportContent
        };

        const currentTimeRange = getCurrentTimeRange();

        showNotification("Đang xử lý ...");

        push(ref(database, `workReports/${currentTimeRange}`), data)
            .then(() => {
                showNotification("Báo cáo công việc thành công!", "success");
                document.getElementById('workReportForm').reset();
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
                showNotification("Không thể gửi dữ liệu. Vui lòng kiểm tra lại!", "error");
            });
    } else {
        showNotification("Vui lòng điền đầy đủ thông tin!", "error");
    }
};

window.submitWorkRegisterForm = function() {
    const registerUserName = document.getElementById('registerUserName').value;
    const scheduleInputs = document.querySelectorAll('input[name="schedule"]');
    const scheduleData = {};

    scheduleInputs.forEach(input => {
        const day = input.closest('tr').querySelector('td').innerText;
        const value = input.value.trim().toUpperCase();
        scheduleData[day] = value || "OFF";
    });

    if (registerUserName) {
        const data = {
            userName: registerUserName,
            schedule: scheduleData
        };

        const currentTimeRange = getCurrentTimeRange();

        showNotification("Đang xử lý ...");

        set(ref(database, `workSchedules/${currentTimeRange}/${registerUserName}`), data)
            .then(() => {
                showNotification("Đăng ký làm việc thành công!", "success");
                document.getElementById('workRegisterForm').reset();
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
                showNotification("Không thể gửi dữ liệu. Vui lòng kiểm tra lại!", "error");
            });
    } else {
        showNotification("Vui lòng điền đầy đủ thông tin!", "error");
    }
};

function showNotification(message, type = "info") {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
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

// Function to format a date range as "từ Thứ 2 ngày..../tháng - Chủ nhật ngày..../tháng..."
function formatDateRange(startDate, endDate) {
    const options = { day: '2-digit', month: '2-digit' };
    const start = startDate.toLocaleDateString('vi-VN', options);
    const end = endDate.toLocaleDateString('vi-VN', options);
    return `Thứ 2 ngày ${start} - Chủ nhật ngày ${end}`;
}