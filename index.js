const loginForm = document.getElementById('loginForm');
const responseMsg = document.getElementById('responseMsg');
const submitBtn = document.getElementById('submitBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData);

    // تفعيل حالة التحميل
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري التحقق...";
    responseMsg.style.display = "none";

    try {
        const response = await fetch('https://safe-click-mp7y.onrender.com/api/students/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showResult("تم تسجيل الدخول بنجاح! جاري التوجيه...", "success");
            
            // 1. حفظ التوكن وبيانات المستخدم (اختياري) في الـ LocalStorage
            if (result.token) {
                localStorage.setItem('userToken', result.token);
            }
            
            // إذا كان الـ API يعيد بيانات المستخدم (مثل الاسم أو الصورة)
            if (result.user) {
                localStorage.setItem('userData', JSON.stringify(result.user));
            }

            // 2. التوجيه إلى صفحة profile.html بعد ثانية واحدة
            setTimeout(() => {
                window.location.href = './profile.html';
            }, 1000);
            
        } else {
            // التعامل مع الأخطاء القادمة من السيرفر
            throw new Error(result.message || "البريد أو كلمة المرور غير صحيحة");
        }

    } catch (error) {
        // عرض رسالة الخطأ للمستخدم
        showResult(error.message, "error");
    } finally {
        // إعادة زر الإرسال لحالته الطبيعية
        submitBtn.disabled = false;
        submitBtn.innerText = "دخول";
    }
});

function showResult(text, type) {
    responseMsg.innerText = text;
    responseMsg.className = `message ${type}`;
    responseMsg.style.display = "block";
}