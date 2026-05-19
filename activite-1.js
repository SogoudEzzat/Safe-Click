let score = 0;
let currentId = 1;

// =====================
// جلب السؤال من الباك اند
// =====================
async function fetchQuestion(id) {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        alert('لا يوجد رمز مصادقة. الرجاء تسجيل الدخول أولاً.');
        return null;
    }

    try {
        const response = await fetch('https://safe-click-mp7y.onrender.com/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${userToken}`
            },
            body: JSON.stringify({ currentId: id })
        });

        if (!response.ok) return null;
        return await response.json();

    } catch (error) {
        return null;
    }
}

// =====================
// إرسال الإجابة للباك اند
// =====================
async function submitAnswer(questionId, answerIndex) {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) return null;

    try {
        const response = await fetch('https://safe-click-mp7y.onrender.com/api/questions/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${userToken}`
            },
            body: JSON.stringify({
                questionId: questionId.toString(),
                answer: answerIndex
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            alert('خطأ: ' + (err.message || 'حدث خطأ في إرسال الإجابة'));
            return null;
        }

        return await response.json();

    } catch (error) {
        alert('خطأ في الاتصال بالخادم');
        return null;
    }
}

// =====================
// عرض اللودر
// =====================
function showLoading() {
    const optionsContainer = document.getElementById('options-container');
    const questionText = document.getElementById('question-text');
    const feedback = document.getElementById('feedback');

    if (questionText) questionText.textContent = '';
    if (feedback) { feedback.innerHTML = ''; feedback.style.display = 'none'; }
    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;padding:30px;gap:16px;">
                <div class="dots-loader">
                    <span></span><span></span><span></span>
                </div>
                <p style="color:#4a5568;font-size:20px;">جاري تحميل السؤال التالي...</p>
            </div>
        `;
    }
}

// =====================
// عرض السؤال
// =====================
function displayQuestion(questionData) {
    if (!questionData) return;

    // الأسئلة انتهت
    if (questionData.ended === true) {
        document.getElementById('questions-container').innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h2 style="color:#002b5c;"> انتهت جميع الأسئلة!</h2>
            </div>
        `;
        currentId = 1;
        localStorage.setItem('currentQuestionId', '1');
        return;
    }

    if (!questionData.question || !questionData.options) return;

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');

    if (!questionText || !optionsContainer) return;

    // ✅ عرض الـ id في الكونسول
    console.log('Question ID:', questionData._id, '| currentId:', currentId);

    questionText.textContent = questionData.question;
    optionsContainer.innerHTML = '';
    if (feedback) { feedback.innerHTML = ''; feedback.style.display = 'none'; }

    questionData.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => handleAnswer(btn, index);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('start-container').style.display = 'none';
    document.getElementById('questions-container').style.display = 'block';
}

// =====================
// معالجة الإجابة
// =====================
async function handleAnswer(btn, optionIndex) {
    const allBtns = document.querySelectorAll('#options-container .option-btn');
    allBtns.forEach(b => b.disabled = true);

    const result = await submitAnswer(currentId, optionIndex);
    if (!result) {
        allBtns.forEach(b => b.disabled = false);
        return;
    }

    const feedback = document.getElementById('feedback');

    if (result.correct) {
        btn.classList.add('correct');
        score += result.score || 0;

        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = score;

        if (feedback) {
            feedback.innerHTML = `✅ صحيح! الدرجة: ${result.score}`;
            feedback.style.display = 'block';
            feedback.style.color = '#166534';
        }

        setTimeout(async () => {
            currentId++;
            localStorage.setItem('currentQuestionId', currentId);
            showLoading();
            const nextQuestion = await fetchQuestion(currentId);
            displayQuestion(nextQuestion);
        }, 1500);

    } else {
        btn.classList.add('wrong');

        if (feedback) {
            feedback.innerHTML = '❌ إجابة خاطئة، حاول مرة أخرى!';
            feedback.style.display = 'block';
            feedback.style.color = '#991b1b';
        }

        setTimeout(() => {
            btn.classList.remove('wrong');
            btn.disabled = true;
            allBtns.forEach(b => {
                if (b !== btn) b.disabled = false;
            });
            if (feedback) feedback.style.display = 'none';
        }, 1500);
    }
}

// =====================
// زر ابدأ
// =====================
document.getElementById('start-btn').addEventListener('click', async () => {
    const saved = localStorage.getItem('currentQuestionId');
    currentId = saved ? parseInt(saved) : 1;

    localStorage.setItem('currentQuestionId', currentId);
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('questions-container').style.display = 'block';
    showLoading();

    const questionData = await fetchQuestion(currentId);
    displayQuestion(questionData);
});

// =====================
// تحذير عند الخروج
// =====================
window.addEventListener('beforeunload', function (e) {
    const saved = localStorage.getItem('currentQuestionId');
    if (saved && parseInt(saved) > 1) {
        e.preventDefault();
        e.returnValue = 'لم يتم حفظ إجابتك، هل أنت متأكد من المغادرة؟';
        return e.returnValue;
    }
});

// =====================
// المنيو الجوال
// =====================
const menu = document.querySelector('#mobile-menu');
const navList = document.querySelector('#nav-list');

menu.addEventListener('click', () => {
    navList.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('active');
    }
});