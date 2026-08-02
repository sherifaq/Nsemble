document.addEventListener("DOMContentLoaded", () => {

    // --- كود CSS مخصص لتأثير العدسة والتكبير (يعمل للكمبيوتر فقط) ---
    const zoomStyle = document.createElement('style');
    zoomStyle.innerHTML = `
        /* حاوية الصورة لضمان عدم خروجها من الإطار عند التكبير */
        .img-zoom-wrapper {
            overflow: hidden;
            border-radius: 8px;
            width: 100%;
            height: 450px;
        }
        
        .img-zoom-wrapper .product-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            cursor: zoom-in; /* تحويل الماوس إلى شكل عدسة */
            /* دمج انتقال التكبير مع انتقال الشفافية الخاص بالسلايد شو */
            transition: transform 0.5s ease, opacity 0.3s ease-in-out !important; 
        }
        
        /* تفعيل التكبير فقط في الأجهزة التي تمتلك ماوس (تجاهل الموبايل) */
        @media (hover: hover) {
            .img-zoom-wrapper .product-image:hover {
                transform: scale(1.15); /* نسبة التكبير (يمكنك زيادتها أو تقليلها) */
            }
        }
    `;
    document.head.appendChild(zoomStyle);
    
    // دالة مساعدة ذكية لتحويل اسم اللون إلى كود لوني لعرضه في الدائرة
    const getColorHex = (colorName) => {
    // حماية من القيم الفارغة
        if (!colorName) return '#d3d3d3'; 
        
        // تحويل الكلمة لحروف صغيرة وحذف أي مسافات زائدة
        const name = String(colorName).toLowerCase().trim(); 
        
        // قائمة الألوان
        if (name.includes('black')) return '#000000';
        if (name.includes('white')) return '#ffffff';
        if (name.includes('nude')) return '#e6c2b5';
        if (name.includes('velvet') || name.includes('red') || name.includes('rouge')) return '#a61a2e';
        if (name.includes('pink') || name.includes('rose')) return '#ffb6c1';
        if (name.includes('blue')) return '#2b547e';
        if (name.includes('beige')) return '#e3dac9'; // لون البيج
        if (name.includes('taupe')) return '#483c32'; // لون التوب
        if (name.includes('coffee')) return '#ba9c80'; // لون التوب
        if (name.includes('olive-green')) return '#7b7943'; // لون التوب

        return '#d3d3d3'; // اللون الافتراضي الرمادي
    };
    // Generate Product Cards
    const createProductCard = (product) => {
        let priceHtml = '';
        let badgeHtml = '';

        // التحقق من وجود سعر عرض وحالته
        if (product.offerPrice) {
            if (product.offerPrice < product.price) {
                // الحالة الأولى: سعر العرض أقل من السعر الأصلي (شطب السعر الأصلي)
                priceHtml = `
                    <div class="price">
                        <span style="text-decoration: line-through; color: #888; margin-right: 8px; font-size: 0.9em;">
                            ${product.price.toLocaleString('en-US')}
                        </span>
                        <span style="color: #d9534f; font-weight: bold;">
                            ${product.offerPrice.toLocaleString('en-US')} ${product.currency}
                        </span>
                    </div>
                `;
            } else if (product.offerPrice === product.price) {
                // الحالة الثانية: السعران متطابقان (إظهار السعر العادي مع كلمة Offer)
                priceHtml = `<div class="price">${product.price.toLocaleString('en-US')} ${product.currency}</div>`;
                badgeHtml = `
                    <span style="position: absolute; top: 10px; right: 10px; background-color: #000; color: #fff; padding: 4px 10px; font-size: 12px; border-radius: 4px; z-index: 2;">
                        Offer
                    </span>
                `;
            }
        } else {
            // الحالة الثالثة: لا يوجد سعر عرض من الأساس
            priceHtml = `<div class="price">${product.price.toLocaleString('en-US')} ${product.currency}</div>`;
        }

        // إرجاع كود البطاقة النهائي
        return `
            <article class="product-card" style="position: relative;">
                ${badgeHtml} <!-- شارة العرض (ستظهر فقط إذا تحقق الشرط الثاني) -->
                
                <!-- حاوية التكبير والصورة -->
                <div class="img-zoom-wrapper">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image" data-images="${product.images.join(',')}">
                </div>
                
                <div class="brand">${product.brand}</div>
                <h3>${product.name}</h3>

                <!-- 👇 الجزء الجديد: عرض الوصف بخط صغير ولون رمادي هادئ 👇 -->
                ${product.description ? `
                    <p style="font-size: 0.85rem; color: #666; margin: 4px 0 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${product.description}
                    </p>
                ` : ''}
                
                ${priceHtml} <!-- السعر بالتنسيق الجديد -->
                
                <!-- عرض الألوان كدوائر أيقونية جذابة -->
                ${product.colors && product.colors.length > 0 && product.colors[0].toLowerCase() !== 'none' ? `
                <div class="product-colors" style="display: flex; gap: 6px; margin: 8px 0; justify-content: center;">
                    ${product.colors.map(color => `
                        <span title="${color}" style="
                            width: 16px; 
                            height: 16px; 
                            border-radius: 0%; 
                            display: inline-block; 
                            background-color: ${getColorHex(color)}; 
                            border: 1px solid #ccc;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            cursor: pointer;
                        "></span>
                    `).join('')}
                </div>
                ` : '<div style="height: 24px; margin: 8px 0;"></div>'}

                <button class="btn btn-primary whatsapp-order-btn" data-name="${product.name}" style="margin-top: 15px; padding: 10px 20px; font-size: 0.8rem;">
                    Order via WhatsApp
                </button>
            </article>
        `;
    };

    // Populate Special Offers (قسم العروض الخاصة)
    const specialOffersGrid = document.getElementById('special-offers-grid');
    if (specialOffersGrid) {
        // جلب المنتجات التي تحتوي على offer: true
        const offerItems = products.filter(p => p.offer).slice(0, 4); 
        specialOffersGrid.innerHTML = offerItems.map(createProductCard).join('');
    }

    // Populate New Arrivals on Index
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (newArrivalsGrid) {
        const newItems = products.filter(p => p.newArrival).slice(0, 4);
        newArrivalsGrid.innerHTML = newItems.map(createProductCard).join('');
    }

    // Populate Featured Products on Index (تم إضافة هذا القسم)
    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid) {
        const featuredItems = products.filter(p => p.featured).slice(0, 4);
        featuredGrid.innerHTML = featuredItems.map(createProductCard).join('');
    }

    // Populate Best Sellers on Index (تم إضافة هذا القسم)
    const bestSellersGrid = document.getElementById('best-sellers-grid');
    if (bestSellersGrid) {
        const bestSellerItems = products.filter(p => p.bestSeller).slice(0, 4);
        bestSellersGrid.innerHTML = bestSellerItems.map(createProductCard).join('');
    }

    // Populate Category Page based on URL parameter
    const categoryGrid = document.getElementById('category-grid');
    if (categoryGrid) {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        document.getElementById('category-title').textContent = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All Products';
        const filtered = type ? products.filter(p => p.category === type) : products;
        categoryGrid.innerHTML = filtered.map(createProductCard).join('');
    }

    // Populate Brands Page
    const brandsGrid = document.getElementById('brands-grid');
    if (brandsGrid) {
        brandsGrid.innerHTML = brands.map(brand => `
            <div class="category-card" style="text-align: center;">
                <div class="category-img-placeholder" style="height: 120px; width: 120px; margin: 0 auto; border-radius: 10px; font-size: 1rem;">
                    ${brand}
                </div>
                <!-- تم حذف سطر h3 من هنا -->
            </div>
        `).join('');
    }

    // WhatsApp Order Logic
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('whatsapp-order-btn')) {
            const productName = e.target.getAttribute('data-name');
            const waNumber = "+201023350404"; // Replace with actual WhatsApp number
            const message = `Hello Nsemble, I would like to pre-order: ${productName}.`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        }
    });

    // --- كود السلايد شو السلس عند وقوف الماوس ---
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('product-image')) {
            const imagesStr = e.target.getAttribute('data-images');
            if (!imagesStr) return;
            
            const images = imagesStr.split(',');
            if (images.length > 1 && !e.target.hoverInterval) {
                let currentIndex = 0;
                
                // تغيير الصورة كل 1500 مللي ثانية ليكون هناك وقت كافٍ للاستمتاع بالصورة
                e.target.hoverInterval = setInterval(() => {
                    // 1. خفض الشفافية لعمل تأثير التلاشي السلس
                    e.target.style.opacity = '0.4'; 
                    
                    // 2. الانتظار حتى ينتهي التلاشي، ثم تغيير الصورة وإعادتها
                    setTimeout(() => {
                        currentIndex = (currentIndex + 1) % images.length;
                        e.target.src = images[currentIndex];
                        
                        // 3. إظهار الصورة الجديدة بسلاسة
                        e.target.style.opacity = '1'; 
                    }, 300); // 300 مللي ثانية هي نفس مدة انتقال الـ CSS
                    
                }, 1500); 
            }
        }
    });

    // إيقاف السلايد شو والعودة للصورة الأولى بانسحاب سلس عند إبعاد الماوس
    document.body.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('product-image')) {
            if (e.target.hoverInterval) {
                clearInterval(e.target.hoverInterval);
                e.target.hoverInterval = null;
            }
            
            // عمل تلاشي سلس للعودة للصورة الأساسية
            e.target.style.opacity = '0.4';
            setTimeout(() => {
                const imagesStr = e.target.getAttribute('data-images');
                if (imagesStr) {
                    const images = imagesStr.split(',');
                    e.target.src = images[0];
                }
                e.target.style.opacity = '1';
            }, 300);
        }
    });

    // تفعيل قائمة الموبايل (Burger Menu)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
});