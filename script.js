// DOM Selections
// Select all key DOM elements that will be manipulated throughout the application
// These selections provide references to different screens, forms, buttons, and display elements
const signupScreen = document.getElementById('signupScreen');
const appScreen = document.getElementById('appScreen');
const examForm = document.getElementById('examForm');
const examList = document.getElementById('examList');
const studyScreen = document.getElementById('studyScreen');
const MonthlyProgressScreen = document.getElementById('MonthlyProgressScreen');
const UpcomingExamsScreen = document.getElementById('UpcomingExamsScreen');
const studyHeader = document.getElementById('studyHeader');
const timerDisplay = document.getElementById('timerDisplay');
const timerContainer = document.getElementById('timerContainer');
const studyEndMessage = document.getElementById('studyEndMessage');
const backToExamsButton = document.getElementById('backToExams');
const startStopTimerButton = document.getElementById('startStopTimer');
const MonthlyProgressButton = document.getElementById('MonthlyProgressButton');
const UpcomingExamsButton = document.getElementById('UpcomingExamsButton');
const backToMainMenu = document.getElementById('backToMainMenu');
const backToMainMenuFromUpcoming = document.getElementById('backToMainMenuFromUpcoming');
const skipTimeButton = document.getElementById('skipTimeButton');

// State Variables
// Manage the core state of the application, tracking exams, timer, and session progress
let exams = []; // Array to store all exams added by the user
let currentExamIndex = null; // Index of the exam currently being studied
let timer = null; // Interval timer for study/break sessions
let timeLeft = 25 * 60; // Default study session time (25 minutes in seconds)
let isBreak = false; // Flag to track if current session is a break
let isTimerRunning = false; // Flag to track if timer is actively counting down
let sessionCompleted = false; // Flag to track if a full study+break session is completed

// Data Structures
// Track monthly progress statistics for user insights
const MonthlyData = {
    subjectsThisMonth: 0, // Total number of subjects added this month
    examsThisMonth: 0, // Total number of exams scheduled this month
    subjectsStarted: 0, // Number of subjects with at least one study session
    subjectsCompleted: 0, // Number of subjects fully studied
};

// Authentication Related Code
// Handle initial signup form submission
// Prevents default form submission and shows the main app screen
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    signupScreen.style.display = 'none';
    appScreen.style.display = 'block';
});

// Capture and display user name and username
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Get user input values
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;

    // Update welcome message with username
    const userNameElement = document.getElementById('userName');
    userNameElement.textContent = username;
    document.getElementById('welcomeMessage').style.display = 'block';

    // Hide signup screen and show main app screen
    signupScreen.style.display = 'none';
    appScreen.style.display = 'block';
});

// Placeholder for sign-in functionality (not yet implemented)
document.getElementById('signinLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert("Sign In functionality is not implemented yet.");
});

// Exam Management Code
// Handle adding a new exam to the study list
examForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Collect exam details from form inputs
    const subject = document.getElementById('subject').value;
    const subtopics = parseInt(document.getElementById('subtopics').value);
    const examDate = new Date(document.getElementById('examDate').value);
    
    // Calculate study requirements
    const daysToExam = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
    const totalStudyMinutes = subtopics * 30 * daysToExam;

    // Create exam object with detailed study tracking
    const exam = {
        subject, // Name of the subject
        subtopics, // Number of subtopics in the subject
        studied: 0, // Total time studied (placeholder)
        totalStudyMinutes, // Total recommended study time
        studySessionsCompleted: 0, // Number of Pomodoro sessions completed
        studySessionsNeeded: Math.ceil(totalStudyMinutes / 25), // Total sessions needed
        date: examDate // Exam date
    };

    // Add exam to list and update monthly stats
    exams.push(exam);
    MonthlyData.subjectsThisMonth++;
    MonthlyData.examsThisMonth++;
    
    // Reset form and update exam list display
    document.getElementById('examForm').reset();
    updateExamList();
});

// Update the visual list of exams with progress indicators
function updateExamList() {
    examList.innerHTML = ''; // Clear existing list
    exams.forEach((exam, index) => {
        const examDiv = document.createElement('div');
        examDiv.classList.add('exam-item');

        // Create progress bar to visualize study progress
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        const progress = document.createElement('div');
        progress.classList.add('progress');
        // Calculate and set progress width as a percentage
        progress.style.width = `${(exam.studySessionsCompleted / exam.studySessionsNeeded) * 100}%`;
        progressBar.appendChild(progress);

        // Create study button to start studying this exam
        const openButton = document.createElement('button');
        openButton.textContent = 'Study';
        openButton.onclick = () => openStudyScreen(index);

        // Set exam details HTML
        examDiv.innerHTML = `
            <strong>${exam.subject}</strong> - ${Math.round((exam.studySessionsCompleted / exam.studySessionsNeeded) * 100)}% complete
            <br>Study Sessions Completed: ${exam.studySessionsCompleted}/${exam.studySessionsNeeded}
        `;
        examDiv.appendChild(progressBar);
        examDiv.appendChild(openButton);
        examList.appendChild(examDiv);
    });
}

// Display upcoming exams sorted by date
function displayUpcomingExams() {
    const upcomingExamsList = document.getElementById('upcomingExamsList');
    upcomingExamsList.innerHTML = ''; // Clear existing list

    // Sort exams chronologically
    const sortedExams = exams.slice().sort((a, b) => a.date - b.date);

    // Create list items for each upcoming exam
    sortedExams.forEach(exam => {
        const examDiv = document.createElement('div');
        examDiv.textContent = `${exam.subject} - ${exam.date.toLocaleDateString()}`;
        upcomingExamsList.appendChild(examDiv);
    });
}

// Open study screen for a specific exam
function openStudyScreen(index) {
    currentExamIndex = index; // Track current exam being studied
    // Set header text based on study or break state
    studyHeader.textContent = isBreak ? 'Break Time!' : `Studying: ${exams[index].subject}`;
    // Set timer to either break time or remaining study time
    timeLeft = isBreak ? 5 * 60 : exams[index].timeLeft || 25 * 60;
    // Switch screens
    appScreen.style.display = 'none';
    studyScreen.style.display = 'block';
    updateTimerDisplay();
}

// Timer Related Code
// Handle start/stop of study timer
startStopTimerButton.addEventListener('click', () => {
    if (isTimerRunning) {
        // Stop timer if already running
        clearInterval(timer);
        isTimerRunning = false;
        startStopTimerButton.textContent = 'Start Timer';
    } else {
        // Start timer countdown
        isTimerRunning = true;
        startStopTimerButton.textContent = 'Stop Timer';
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                // Timer reached zero, handle session end
                clearInterval(timer);
                isTimerRunning = false;
                startStopTimerButton.textContent = 'Start Timer';
                handleTimerEnd();
            } else {
                // Decrement time and update display
                timeLeft--;
                updateTimerDisplay();
            }
        }, 1000);
    }
});

// Manage what happens when a timer session ends
function handleTimerEnd() {
    if (isBreak) {
        // End of break, reset for next study session
        isBreak = false;
        sessionCompleted = true;
        studyHeader.textContent = '';
        timerContainer.style.display = 'none';
        studyEndMessage.style.display = 'block';
        
        // Update exam and monthly progress
        exams[currentExamIndex].studySessionsCompleted++;
        MonthlyData.subjectsStarted++;
        if (exams[currentExamIndex].studySessionsCompleted === exams[currentExamIndex].studySessionsNeeded) {
            MonthlyData.subjectsCompleted++;
        }
        updateExamList();
    } else {
        // End of study session, start break
        isBreak = true;
        studyHeader.textContent = 'Break Time!';
        timeLeft = 5 * 60;
        updateTimerDisplay();
    }
}

// Allow user to skip current timer session
skipTimeButton.addEventListener('click', () => {
    timeLeft = 0;
    handleTimerEnd();
});

// Return to main menu from study end screen
document.getElementById('returnToMainMenu').addEventListener('click', () => {
    // Reset screen states and timer
    studyScreen.style.display = 'none';
    appScreen.style.display = 'block';
    studyEndMessage.style.display = 'none';
    timerContainer.style.display = 'block';
    
    // Reset session variables
    isBreak = false;
    sessionCompleted = false;
    timeLeft = 25 * 60;
    
    // Update display
    updateTimerDisplay();
    updateExamList();
});

// Update timer display with current time remaining
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    // Format time with leading zeros
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 7. Navigation Code
// Navigate to Monthly Progress screen
MonthlyProgressButton.addEventListener('click', () => {
    // Hide main app, show progress screen
    appScreen.style.display = 'none';
    MonthlyProgressScreen.style.display = 'block';
    
    // Update progress statistics
    document.getElementById('subjectsThisMonth').textContent = `Subjects This Month: ${MonthlyData.subjectsThisMonth}`;
    document.getElementById('examsThisMonth').textContent = `Exams This Month: ${MonthlyData.examsThisMonth}`;
    document.getElementById('subjectsStarted').textContent = `Subjects Started: ${MonthlyData.subjectsStarted}`;
    document.getElementById('subjectsCompleted').textContent = `Subjects Completed: ${MonthlyData.subjectsCompleted}`;
});

// Navigate to Upcoming Exams screen
UpcomingExamsButton.addEventListener('click', () => {
    // Hide main app, show upcoming exams
    appScreen.style.display = 'none';
    UpcomingExamsScreen.style.display = 'block';
    displayUpcomingExams();
});

// Return to main menu from Monthly Progress screen
backToMainMenu.addEventListener('click', () => {
    MonthlyProgressScreen.style.display = 'none';
    appScreen.style.display = 'block';
});

// Return to main menu from Upcoming Exams screen
backToMainMenuFromUpcoming.addEventListener('click', () => {
    UpcomingExamsScreen.style.display = 'none';
    appScreen.style.display = 'block';
});

// Return to exam list from study screen
backToExamsButton.addEventListener('click', () => {
    studyScreen.style.display = 'none';
    appScreen.style.display = 'block';
    
    // Stop timer and save current timer state
    clearInterval(timer);
    timer = null;
    exams[currentExamIndex].timeLeft = timeLeft;
    
    // Update exam list
    updateExamList();
});