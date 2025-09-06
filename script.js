// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const chapters = document.querySelectorAll('.chapter');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const backToTopBtn = document.getElementById('backToTop');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');
const markdownButtons = document.querySelectorAll('.markdown-btn');

// Chapter navigation functionality
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const chapterNum = button.getAttribute('data-chapter');
        
        // Remove active class from all buttons and chapters
        navButtons.forEach(btn => btn.classList.remove('active'));
        chapters.forEach(chapter => chapter.classList.remove('active'));
        
        // Add active class to clicked button and corresponding chapter
        button.classList.add('active');
        document.getElementById(`chapter${chapterNum}`).classList.add('active');
        
        // Update progress bar
        const progress = (chapterNum / 10) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Capítulo ${chapterNum} de 10`;
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Pause all audio and video elements
        pauseAllMedia();
    });
});

// Function to pause all media
function pauseAllMedia() {
    const allAudio = document.querySelectorAll('audio');
    const allVideo = document.querySelectorAll('video');
    
    allAudio.forEach(audio => {
        audio.pause();
    });
    
    allVideo.forEach(video => {
        video.pause();
    });
}

// Back to top button functionality
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const activeButton = document.querySelector('.nav-btn.active');
    const currentChapter = parseInt(activeButton.getAttribute('data-chapter'));
    
    if (e.key === 'ArrowLeft' && currentChapter > 1) {
        document.querySelector(`[data-chapter="${currentChapter - 1}"]`).click();
    } else if (e.key === 'ArrowRight' && currentChapter < 10) {
        document.querySelector(`[data-chapter="${currentChapter + 1}"]`).click();
    } else if (e.key === 'Escape') {
        closeModal();
    }
});

// Markdown Modal functionality
markdownButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const fileName = button.getAttribute('data-file');
        const chapterNumber = fileName.match(/\d+/)[0];
        
        modalTitle.textContent = `Resumo do Capítulo ${chapterNumber}`;
        modalBody.innerHTML = '<div class="loading">Carregando resumo...</div>';
        modalOverlay.classList.add('active');
        
        try {
            const response = await fetch(`mídias/${fileName}`);
            
            if (!response.ok) {
                throw new Error(`Arquivo não encontrado: ${fileName}`);
            }
            
            const markdownContent = await response.text();
            const htmlContent = marked.parse(markdownContent);
            
            modalBody.innerHTML = htmlContent;
        } catch (error) {
            console.error('Erro ao carregar o arquivo markdown:', error);
            modalBody.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <h3>📄 Arquivo não encontrado</h3>
                    <p>O arquivo <strong>${fileName}</strong> não foi encontrado na pasta "mídias".</p>
                    <p>Certifique-se de que o arquivo existe e está no local correto.</p>
                    <small style="color: #666; margin-top: 20px; display: block;">
                        Estrutura esperada: mídias/${fileName}
                    </small>
                </div>
            `;
        }
    });
});

// Modal close functionality
function closeModal() {
    modalOverlay.classList.remove('active');
}

closeBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Initialize progress bar
progressFill.style.width = '10%';

// Add smooth transitions for media elements
document.addEventListener('DOMContentLoaded', () => {
    const mediaElements = document.querySelectorAll('audio, video');
    
    mediaElements.forEach(media => {
        media.addEventListener('loadstart', () => {
            media.style.opacity = '0.5';
        });
        
        media.addEventListener('canplay', () => {
            media.style.opacity = '1';
        });
        
        media.addEventListener('error', () => {
            const container = media.closest('.media-container');
            container.innerHTML = '<div class="error-message" style="text-align: center; padding: 20px; color: #e74c3c; background: #f8f9fa; border-radius: 10px;">📱 Mídia não encontrada. Verifique se o arquivo está na pasta "mídias".</div>';
        });
    });
});

// Chapter completion tracking
let chapterProgress = {};

function markChapterAsRead(chapterNum) {
    chapterProgress[chapterNum] = true;
    updateChapterButton(chapterNum);
    saveProgress();
}

function updateChapterButton(chapterNum) {
    const button = document.querySelector(`[data-chapter="${chapterNum}"]`);
    if (chapterProgress[chapterNum]) {
        button.style.background = 'rgba(76, 175, 80, 0.3)';
        button.innerHTML = `✓ Capítulo ${chapterNum}`;
    }
}

function saveProgress() {
    try {
        localStorage.setItem('bookProgress', JSON.stringify(chapterProgress));
    } catch (error) {
        console.log('LocalStorage não disponível, progresso não será salvo');
    }
}

function loadProgress() {
    try {
        const saved = localStorage.getItem('bookProgress');
        if (saved) {
            chapterProgress = JSON.parse(saved);
            Object.keys(chapterProgress).forEach(chapterNum => {
                if (chapterProgress[chapterNum]) {
                    updateChapterButton(chapterNum);
                }
            });
        }
    } catch (error) {
        console.log('LocalStorage não disponível, progresso não foi carregado');
    }
}

// Detect when user has scrolled through a chapter
function observeChapterReading() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chapterElement = entry.target;
                const chapterNum = chapterElement.id.replace('chapter', '');
                
                setTimeout(() => {
                    if (entry.intersectionRatio > 0.8) {
                        markChapterAsRead(chapterNum);
                    }
                }, 3000); // Mark as read after 3 seconds of viewing
            }
        });
    }, { threshold: 0.8 });

    chapters.forEach(chapter => {
        observer.observe(chapter);
    });
}

// Print chapter functionality
function printChapter(chapterNum) {
    const chapter = document.getElementById(`chapter${chapterNum}`);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Capítulo ${chapterNum} - Resumo do Livro</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .chapter-header { text-align: center; margin-bottom: 30px; }
                    .content-section { margin-bottom: 30px; }
                    .section-title { font-size: 1.2em; font-weight: bold; margin-bottom: 15px; }
                    .markdown-btn { display: none; }
                    .media-container { display: none; }
                </style>
            </head>
            <body>
                ${chapter.innerHTML.replace(/<audio.*?<\/audio>/g, '[Áudio não disponível na impressão]').replace(/<video.*?<\/video>/g, '[Vídeo não disponível na impressão]')}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Search functionality (bonus feature)
function searchContent(query) {
    const searchTerm = query.toLowerCase();
    const results = [];
    
    chapters.forEach((chapter, index) => {
        const chapterText = chapter.textContent.toLowerCase();
        if (chapterText.includes(searchTerm)) {
            results.push({
                chapter: index + 1,
                title: chapter.querySelector('.chapter-title').textContent
            });
        }
    });
    
    return results;
}

// Touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const activeButton = document.querySelector('.nav-btn.active');
        const currentChapter = parseInt(activeButton.getAttribute('data-chapter'));
        
        if (diffX > 0 && currentChapter < 10) {
            // Swipe left - next chapter
            document.querySelector(`[data-chapter="${currentChapter + 1}"]`).click();
        } else if (diffX < 0 && currentChapter > 1) {
            // Swipe right - previous chapter
            document.querySelector(`[data-chapter="${currentChapter - 1}"]`).click();
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    observeChapterReading();
    loadProgress();
    
    console.log('📚 Página do resumo do livro carregada com sucesso!');
    console.log('🎯 Use as setas do teclado (← →) para navegar entre capítulos');
    console.log('📱 A página é totalmente responsiva e funciona em dispositivos móveis');
    console.log('📄 Clique nos botões de resumo para abrir os arquivos markdown');
    console.log('🔧 Estrutura de arquivos esperada:');
    console.log('   - mídias/capitulo1.md, capitulo2.md, ..., capitulo10.md');
    console.log('   - mídias/capitulo1.mp3, capitulo1.mp4, etc.');
});

// Expose functions globally for debugging
window.bookApp = {
    markChapterAsRead,
    printChapter,
    searchContent,
    chapterProgress
};