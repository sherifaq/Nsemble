document.addEventListener("DOMContentLoaded", () => {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // دالة تنفيذ البحث الفعلي
    const executeSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `./products.html?search=${encodeURIComponent(query)}`;
        }
    };

    if (searchBtn && searchInput && searchContainer) {
        
        searchBtn.addEventListener('click', (e) => {
            // التحقق مما إذا كانت الشاشة موبايل والشريط غير مفتوح
            if (window.innerWidth <= 768 && !searchContainer.classList.contains('active')) {
                e.preventDefault(); // منع أي تحديث للصفحة
                searchContainer.classList.add('active'); // فتح الشريط
                searchInput.focus(); // وضع المؤشر داخل الحقل تلقائياً للكتابة
            } else {
                // إذا كان مفتوحاً أو الشاشة كبيرة، قم بتنفيذ البحث
                executeSearch();
            }
        });

        // تنفيذ البحث عند الضغط على "Enter" من لوحة المفاتيح
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch();
            }
        });
        
        // لمسة احترافية إضافية: إغلاق شريط البحث عند الضغط في أي مكان فارغ بالشاشة
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && searchContainer.classList.contains('active')) {
                if (!searchContainer.contains(e.target)) {
                    searchContainer.classList.remove('active');
                }
            }
        });
    }
});