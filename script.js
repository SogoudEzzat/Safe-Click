const signupForm = document.getElementById('signupForm');
const responseMsg = document.getElementById('responseMsg');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(signupForm);
    const data = Object.fromEntries(formData);

    // التحقق الأساسي
    if (!data.email.includes("@")) {
        showResult("البريد الإلكتروني غير صالح", "error");
        return;
    }
    if (data.password.length < 8) {
        showResult("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error");
        return;
    }

    // تفعيل حالة التحميل
    submitBtn.disabled = true;
    btnText.style.display = "none";
    loader.style.display = "inline-block";
    responseMsg.style.display = "none";

    try {
        const newLocal = 'https://safe-click-mp7y.onrender.com/api/students/register';
        const response = await fetch(newLocal, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // 1. حفظ البيانات في localStorage
            // نستخدم JSON.stringify لحفظ كائن البيانات بالكامل أو حفظ التوكن فقط
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userData', JSON.stringify(result.user || data));

            showResult("تم إنشاء الحساب بنجاح! جاري التحويل...", "success");

            signupForm.reset();

            // 2. الانتقال إلى صفحة ind.html بعد ثانية واحدة ليعرف المستخدم أن العملية نجحت
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);

        } else {
            throw new Error(result?.message || "حدث خطأ غير متوقع، حاول مرة أخرى");
        }

    } catch (error) {
        console.error("Detailed Error:", error);
        showResult(error.message, "error");
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = "inline";
        loader.style.display = "none";
    }
});

function showResult(text, type) {
    responseMsg.innerText = text;
    responseMsg.className = `message ${type}`;    responseMsg.style.display = "block";
}