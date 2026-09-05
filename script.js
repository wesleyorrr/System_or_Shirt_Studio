document.addEventListener('DOMContentLoaded', function () {
    // ==========================================
    // NAVEGAÇÃO ENTRE SEÇÕES
    // ==========================================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = {
        home: document.getElementById('section-home'),
        sobre: document.getElementById('section-sobre'),
        contato: document.getElementById('section-contato')
    };

    function showSection(sectionId) {
        // Esconder todas
        Object.values(sections).forEach(sec => sec.classList.remove('active'));
        // Mostrar a selecionada
        if (sections[sectionId]) sections[sectionId].classList.add('active');
        // Atualizar links
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
        // Atualizar links do rodapé também
        document.querySelectorAll('.footer-links a[data-section]').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) showSection(section);
        });
    });

    // Links do rodapé também navegam
    document.querySelectorAll('.footer-links a[data-section]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) {
                showSection(section);
                // Atualizar também os links do header
                navLinks.forEach(nav => {
                    nav.classList.toggle('active', nav.dataset.section === section);
                });
            }
        });
    });

    // ==========================================
    // FORMULÁRIO DE CONTATO → WHATSAPP
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const phoneNumber = '5538999894056'; // Código do país + DDD + número sem espaços

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const phone = document.getElementById('form-phone').value.trim();
        const message = document.getElementById('form-message').value.trim();

        if (!name || !email || !message) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Construir a mensagem para o WhatsApp
        let text = `Olá! Meu nome é ${name}.`;
        text += `\nE-mail: ${email}`;
        if (phone) text += `\nTelefone: ${phone}`;
        text += `\n\nMensagem:\n${message}`;
        text += `\n\nEnviado via OR System - Camisa Personalizada`;

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });

    // ==========================================
    // EDITOR DE CAMISETAS (código completo)
    // ==========================================
    const colorOptions = document.querySelectorAll('.color-option');
    const shirtDisplay = document.getElementById('shirt-display');
    const shirtSvg = shirtDisplay.querySelector('svg');
    const currentColorDisplay = document.getElementById('current-color');
    const colorPreview = document.getElementById('color-preview');
    const imageUpload = document.getElementById('image-upload');
    const deleteImageBtn = document.getElementById('delete-image');
    const textInput = document.getElementById('text-input');
    const fontFamilySelect = document.getElementById('font-family');
    const fontSizeSelect = document.getElementById('font-size');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const textColorInput = document.getElementById('text-color');
    const addTextBtn = document.getElementById('add-text-btn');
    const deleteTextBtn = document.getElementById('delete-text');
    const saveBtn = document.getElementById('save-design');
    const resetBtn = document.getElementById('reset-design');
    const resizeCard = document.getElementById('resize-card');
    const resizeSlider = document.getElementById('resize-slider');
    const sizeValue = document.getElementById('size-value');
    const applyResizeBtn = document.getElementById('apply-resize');

    let activeElement = null;
    let isBold = false;
    let isItalic = false;
    let isDragging = false;
    let isResizing = false;
    let startWidth, startHeight, startX, startY;
    let originalWidth = 0;
    let resizeTimeout = null;

    // Aplicar cor
    function applyColorToShirt(color) {
        const allPaths = shirtSvg.querySelectorAll('path');
        allPaths.forEach(path => {
            path.style.fill = color;
        });
        currentColorDisplay.textContent = color;
        colorPreview.style.backgroundColor = color;
    }

    // Atualizar card de redimensionamento
    function updateResizeCard() {
        if (activeElement && activeElement.classList.contains('draggable-image')) {
            resizeCard.style.display = 'block';
            originalWidth = parseInt(activeElement.style.width) || 150;
            resizeSlider.value = 100;
            sizeValue.textContent = '100%';
            applyResizeBtn.disabled = false;
        } else {
            resizeCard.style.display = 'none';
            applyResizeBtn.disabled = true;
        }
    }

    function rgbToHex(rgb) {
        if (!rgb || rgb === '') return '#000000';
        if (rgb.startsWith('#')) return rgb;
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return '#000000';
        return '#' + rgbValues.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function selectElement(element) {
        document.querySelectorAll('.draggable').forEach(el => {
            el.classList.remove('active');
            el.style.zIndex = '10';
            if (el.classList.contains('draggable-text')) {
                el.style.backgroundColor = 'transparent';
                el.style.borderRadius = '0';
            }
        });
        element.classList.add('active');
        element.style.zIndex = '11';
        activeElement = element;

        if (element.classList.contains('draggable-text')) {
            textInput.value = element.textContent;
            fontFamilySelect.value = element.style.fontFamily || 'Arial';
            fontSizeSelect.value = element.style.fontSize || '16px';
            textColorInput.value = rgbToHex(element.style.color);
            isBold = element.style.fontWeight === 'bold';
            isItalic = element.style.fontStyle === 'italic';
            boldBtn.classList.toggle('active', isBold);
            italicBtn.classList.toggle('active', isItalic);
            element.style.backgroundColor = 'transparent';
            element.style.borderRadius = '0';
            resizeCard.style.display = 'none';
        }

        if (element.classList.contains('draggable-image')) {
            updateResizeCard();
        }
    }

    function createDraggableImage(src) {
        const newImage = document.createElement('img');
        newImage.src = src;
        newImage.classList.add('draggable', 'draggable-image');
        newImage.draggable = false;
        newImage.style.position = 'absolute';
        newImage.style.left = '50%';
        newImage.style.top = '50%';
        newImage.style.transform = 'translate(-50%, -50%)';
        newImage.style.maxWidth = '200px';
        newImage.style.maxHeight = '200px';
        newImage.style.width = '150px';
        newImage.style.zIndex = '10';
        newImage.style.borderRadius = '6px';

        const positions = [
            { position: 'top-left', cursor: 'nwse-resize' },
            { position: 'top-right', cursor: 'nesw-resize' },
            { position: 'bottom-left', cursor: 'nesw-resize' },
            { position: 'bottom-right', cursor: 'nwse-resize' }
        ];

        shirtDisplay.appendChild(newImage);

        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.classList.add('resize-handle', pos.position);
            handle.style.cursor = pos.cursor;
            newImage.appendChild(handle);
        });

        makeDraggable(newImage);
        makeResizable(newImage);
        selectElement(newImage);
        updateResizeCard();
        deleteImageBtn.disabled = false;
    }

    function createDraggableText(text) {
        const textElement = document.createElement('div');
        textElement.classList.add('draggable', 'draggable-text');
        textElement.textContent = text;
        textElement.contentEditable = true;
        textElement.style.fontFamily = fontFamilySelect.value;
        textElement.style.fontSize = fontSizeSelect.value;
        textElement.style.color = textColorInput.value;
        textElement.style.fontWeight = isBold ? 'bold' : 'normal';
        textElement.style.fontStyle = isItalic ? 'italic' : 'normal';
        textElement.style.position = 'absolute';
        textElement.style.left = '50%';
        textElement.style.top = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.zIndex = '10';
        textElement.style.cursor = 'move';
        textElement.style.padding = '5px';
        textElement.style.minWidth = '50px';
        textElement.style.backgroundColor = 'transparent';
        textElement.style.borderRadius = '0';

        shirtDisplay.appendChild(textElement);
        makeDraggable(textElement);
        selectElement(textElement);
        deleteTextBtn.disabled = false;

        textElement.addEventListener('input', function () {
            if (activeElement === this) {
                textInput.value = this.textContent;
            }
        });

        textElement.addEventListener('blur', function () {
            this.style.backgroundColor = 'transparent';
            this.style.borderRadius = '0';
        });
    }

    function makeDraggable(element) {
        let startX, startY, startLeft, startTop;

        function startDrag(clientX, clientY) {
            if (isResizing) return;
            isDragging = true;
            startX = clientX;
            startY = clientY;
            const computedStyle = window.getComputedStyle(element);
            startLeft = parseInt(computedStyle.left) || 0;
            startTop = parseInt(computedStyle.top) || 0;
            selectElement(element);
            document.body.style.overflow = 'hidden';
            element.classList.add('dragging');
        }

        function duringDrag(clientX, clientY) {
            if (!isDragging) return;
            const dx = clientX - startX;
            const dy = clientY - startY;
            element.style.left = `${startLeft + dx}px`;
            element.style.top = `${startTop + dy}px`;
            element.style.transform = 'none';
        }

        function endDrag() {
            isDragging = false;
            document.body.style.overflow = '';
            element.classList.remove('dragging');
        }

        function onMouseDown(e) {
            if (e.target.classList.contains('resize-handle')) return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            duringDrag(e.clientX, e.clientY);
        }

        function onMouseUp() {
            endDrag();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        function onTouchStart(e) {
            if (e.target.classList.contains('resize-handle')) return;
            e.preventDefault();
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }

        function onTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            duringDrag(touch.clientX, touch.clientY);
        }

        function onTouchEnd() {
            endDrag();
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }

        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('touchstart', onTouchStart, { passive: false });
    }

    function makeResizable(element) {
        const resizeHandles = element.querySelectorAll('.resize-handle');
        if (!resizeHandles.length) return;

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', initResize);
            handle.addEventListener('touchstart', initResizeTouch, { passive: false });
        });

        function initResize(e) {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(element.offsetWidth);
            startHeight = parseInt(element.offsetHeight);
            document.body.style.overflow = 'hidden';
            selectElement(element);
            currentResizeHandle = e.target;
            element.classList.add('resizing');
            resizeHandles.forEach(h => h.classList.add('resizing'));
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        }

        function initResizeTouch(e) {
            e.stopPropagation();
            e.preventDefault();
            const touch = e.touches[0];
            isResizing = true;
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = parseInt(element.offsetWidth);
            startHeight = parseInt(element.offsetHeight);
            document.body.style.overflow = 'hidden';
            selectElement(element);
            currentResizeHandle = e.target;
            element.classList.add('resizing');
            resizeHandles.forEach(h => h.classList.add('resizing'));
            document.addEventListener('touchmove', resizeTouch, { passive: false });
            document.addEventListener('touchend', stopResize);
        }

        function resize(e) {
            if (!isResizing) return;
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            const minSize = 50;
            element.style.width = `${Math.max(minSize, width)}px`;
            element.style.height = `${Math.max(minSize, height)}px`;
        }

        function resizeTouch(e) {
            if (!isResizing) return;
            e.preventDefault();
            const touch = e.touches[0];
            const width = startWidth + (touch.clientX - startX);
            const height = startHeight + (touch.clientY - startY);
            const minSize = 50;
            element.style.width = `${Math.max(minSize, width)}px`;
            element.style.height = `${Math.max(minSize, height)}px`;
        }

        function stopResize() {
            isResizing = false;
            document.body.style.overflow = '';
            currentResizeHandle = null;
            element.classList.remove('resizing');
            resizeHandles.forEach(h => h.classList.remove('resizing'));
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', resizeTouch);
            document.removeEventListener('touchend', stopResize);
        }
    }

    // Eventos: Cores
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = this.getAttribute('data-color');
            applyColorToShirt(selectedColor);
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    applyColorToShirt('#FFFFFF');

    // Eventos: Upload
    imageUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (event) {
                createDraggableImage(event.target.result);
                imageUpload.value = '';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    deleteImageBtn.addEventListener('click', function () {
        if (activeElement && activeElement.classList.contains('draggable-image')) {
            activeElement.remove();
            activeElement = null;
            if (document.querySelectorAll('.draggable-image').length === 0) {
                deleteImageBtn.disabled = true;
                resizeCard.style.display = 'none';
            }
        }
    });

    // Eventos: Texto
    boldBtn.addEventListener('click', function () {
        isBold = !isBold;
        this.classList.toggle('active', isBold);
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontWeight = isBold ? 'bold' : 'normal';
        }
    });

    italicBtn.addEventListener('click', function () {
        isItalic = !isItalic;
        this.classList.toggle('active', isItalic);
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontStyle = isItalic ? 'italic' : 'normal';
        }
    });

    textColorInput.addEventListener('input', function () {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.color = this.value;
        }
    });

    fontFamilySelect.addEventListener('change', function () {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontFamily = this.value;
        }
    });

    fontSizeSelect.addEventListener('change', function () {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.style.fontSize = this.value;
        }
    });

    addTextBtn.addEventListener('click', function () {
        const text = textInput.value.trim();
        if (text) {
            createDraggableText(text);
            textInput.value = '';
        }
    });

    deleteTextBtn.addEventListener('click', function () {
        if (activeElement && activeElement.classList.contains('draggable-text')) {
            activeElement.remove();
            activeElement = null;
            if (document.querySelectorAll('.draggable-text').length === 0) {
                deleteTextBtn.disabled = true;
            }
        }
    });

    textInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTextBtn.click();
        }
    });

    // Eventos: Resize
    resizeSlider.addEventListener('input', function () {
        sizeValue.textContent = `${this.value}%`;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (activeElement && activeElement.classList.contains('draggable-image')) {
                const newWidth = (originalWidth * this.value) / 100;
                activeElement.style.width = `${newWidth}px`;
                activeElement.style.height = 'auto';
            }
        }, 100);
    });

    applyResizeBtn.addEventListener('click', function () {
        if (activeElement && activeElement.classList.contains('draggable-image')) {
            originalWidth = parseInt(activeElement.style.width) || 150;
        }
    });

    // Deselecionar ao clicar fora
    shirtDisplay.addEventListener('click', function (e) {
        if (!e.target.classList.contains('draggable') && !e.target.classList.contains('resize-handle')) {
            document.querySelectorAll('.draggable').forEach(el => {
                el.classList.remove('active');
                if (el.classList.contains('draggable-text')) {
                    el.style.backgroundColor = 'transparent';
                    el.style.borderRadius = '0';
                }
            });
            activeElement = null;
            resizeCard.style.display = 'none';
        }
    });

    // Duplo clique para editar texto
    shirtDisplay.addEventListener('dblclick', function (e) {
        if (e.target.classList.contains('draggable-text')) {
            e.target.focus();
            const range = document.createRange();
            range.selectNodeContents(e.target);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    // Reset
    resetBtn.addEventListener('click', function () {
        document.querySelectorAll('.draggable').forEach(el => el.remove());
        activeElement = null;
        deleteImageBtn.disabled = true;
        deleteTextBtn.disabled = true;
        resizeCard.style.display = 'none';
        textInput.value = '';
        applyColorToShirt('#FFFFFF');
        colorOptions.forEach(opt => opt.classList.remove('active'));
        document.querySelector('.color-option[data-color="#FFFFFF"]').classList.add('active');
    });

    // Salvar imagem com marca d'água sutil
    saveBtn.addEventListener('click', function () {
        const originalHTML = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';

        document.querySelectorAll('.resize-handle').forEach(handle => {
            handle.style.display = 'none';
        });

        html2canvas(shirtDisplay, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const ctx = canvas.getContext('2d');

            // Marca d'água sutil com o símbolo da OR System
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Símbolo sutil
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = 'rgba(0, 123, 255, 0.25)';
            ctx.fillText('✦ OR System', canvas.width / 2, canvas.height - 15);

            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(0, 123, 255, 0.10)';
            ctx.font = '10px Arial';
            ctx.fillText('or system', canvas.width / 2, canvas.height - 2);

            const link = document.createElement('a');
            link.download = 'minha_camisa_or_system.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });

            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHTML;
        }).catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao gerar a imagem. Tente novamente.');
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHTML;
        });
    });

    // Prevenir comportamento padrão de toque
    document.addEventListener('touchmove', function (e) {
        if (isDragging || isResizing) {
            e.preventDefault();
        }
    }, { passive: false });
});