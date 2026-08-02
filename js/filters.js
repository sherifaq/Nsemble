document.addEventListener("DOMContentLoaded", () => {
    const mainGrid = document.getElementById('main-catalog-grid');
    const catFilter = document.getElementById('category-filter');
    const brandFilter = document.getElementById('brand-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    // جلب عناصر البحث للبحث الحي (Live Search)
    const searchInput = document.getElementById('search-input');

    if (!mainGrid) return;

    // 1. ⚠️ إضافة دالة الألوان المفقودة هنا لكي لا يتوقف الكود ⚠️
    const getColorHex = (colorName) => {
        if (!colorName) return '#d3d3d3'; 
        const name = String(colorName).toLowerCase().trim(); 
        if (name.includes('black')) return '#000000';
        if (name.includes('white')) return '#ffffff';
        if (name.includes('nude')) return '#e6c2b5';
        if (name.includes('velvet') || name.includes('red') || name.includes('rouge')) return '#a61a2e';
        if (name.includes('pink') || name.includes('rose')) return '#ffb6c1';
        if (name.includes('blue')) return '#2b547e';
        if (name.includes('beige')) return '#e3dac9'; 
        if (name.includes('taupe')) return '#483c32'; 
        if (name.includes('coffee')) return '#ba9c80'; 
        if (name.includes('olive-green')) return '#7b7943'; 
        return '#d3d3d3'; 
    };

    // 2. قراءة كلمة البحث من الرابط (URL)
    const params = new URLSearchParams(window.location.search);
    let searchQuery = params.get('search')?.toLowerCase() || '';

    // تفعيل مربع البحث (Live Search)
    if (searchInput) {
        if (searchQuery) searchInput.value = searchQuery;
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    // 3. تعبئة قائمة الماركات في الفلتر الجانبي
    if (brandFilter && typeof brands !== 'undefined') {
        brandFilter.innerHTML = '<option value="all">All</option>' + 
            brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    // 4. دالة رسم المنتجات على الشاشة (تمت إضافة أسعار العروض والوصف)
    const renderProducts = (data) => {
        if (data.length === 0) {
            mainGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">No products found matching your criteria.</p>';
            return;
        }
        
        mainGrid.innerHTML = data.map(p => {
            const imagesList = (p.images && p.images.length > 0) ? p.images.join(',') : '';
            const firstImage = (p.images && p.images.length > 0) ? p.images[0] : '';
            
            // حساب السعر والعروض
            let priceHtml = '';
            let badgeHtml = '';

            if (p.offerPrice) {
                if (p.offerPrice < p.price) {
                    priceHtml = `
                        <div class="price">
                            <span style="text-decoration: line-through; color: #888; margin-right: 8px; font-size: 0.9em;">
                                ${p.price.toLocaleString('en-US')}
                            </span>
                            <span style="color: #d9534f; font-weight: bold;">
                                ${p.offerPrice.toLocaleString('en-US')} ${p.currency}
                            </span>
                        </div>
                    `;
                } else if (p.offerPrice === p.price) {
                    priceHtml = `<div class="price">${p.price.toLocaleString('en-US')} ${p.currency}</div>`;
                    badgeHtml = `<span style="position: absolute; top: 10px; right: 10px; background-color: #000; color: #fff; padding: 4px 10px; font-size: 12px; border-radius: 4px; z-index: 2;">Offer</span>`;
                } else {
                    priceHtml = `<div class="price">${p.price.toLocaleString('en-US')} ${p.currency}</div>`;
                }
            } else {
                priceHtml = `<div class="price">${p.price.toLocaleString('en-US')} ${p.currency}</div>`;
            }
            
            return `
            <article class="product-card" style="position: relative;">
                ${badgeHtml}
                <div class="img-zoom-wrapper">
                    <img src="${firstImage}" alt="${p.name}" class="product-image" data-images="${imagesList}">
                </div>
                
                <div class="brand">${p.brand}</div>
                <h3>${p.name}</h3>
                
                ${p.description ? `
                    <p style="font-size: 0.85rem; color: #666; margin: 4px 0 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${p.description}
                    </p>
                ` : ''}

                ${priceHtml}
                
                ${p.colors && p.colors.length > 0 && p.colors[0].toLowerCase() !== 'none' ? `
                <div class="product-colors" style="display: flex; gap: 6px; margin: 8px 0; justify-content: center;">
                    ${p.colors.map(color => `
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

                <button class="btn btn-primary whatsapp-order-btn" data-name="${p.name}" style="margin-top: 15px; width: 100%;">
                    Order via WhatsApp
                </button>
            </article>
        `}).join('');
    };

    // 5. دالة تطبيق البحث والفلاتر (بشكل ذكي يحمي من الأخطاء)
    const applyFilters = () => {
        let filtered = [...products];
        
        if (typeof searchQuery !== 'undefined' && searchQuery) {
            filtered = filtered.filter(p => {
                const s = searchQuery.toLowerCase().trim();
                return (
                    p.name?.toLowerCase().includes(s) ||
                    p.brand?.toLowerCase().includes(s) ||
                    p.category?.toLowerCase().includes(s)
                );
            });
        }
        
        if (catFilter && catFilter.value !== 'all') {
            filtered = filtered.filter(p => 
                p.category && p.category.toLowerCase().trim() === catFilter.value.toLowerCase().trim()
            );
        }
        
        if (brandFilter && brandFilter.value !== 'all') {
            filtered = filtered.filter(p => p.brand === brandFilter.value);
        }
        
        if (sortFilter) {
            const sortVal = sortFilter.value;
            const getEffectivePrice = (product) => {
                return (product.offerPrice && product.offerPrice < product.price) ? product.offerPrice : product.price;
            };

            if (sortVal === 'price-low') filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
            if (sortVal === 'price-high') filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
            if (sortVal === 'newest') filtered.sort((a, b) => (a.newArrival === b.newArrival) ? 0 : a.newArrival ? -1 : 1);
        }
        
        renderProducts(filtered);
    };

    // الاستماع لأي تغيير في الفلاتر
    if (catFilter) catFilter.addEventListener('change', applyFilters);
    if (brandFilter) brandFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);

    // التشغيل الأول
    applyFilters(); 
});