class HuggingFaceApp {
    constructor() {
        this.modelsContainer = document.getElementById('modelsContainer');
        this.loadingElement = document.getElementById('loading');
        this.searchInput = document.getElementById('searchInput');
    }

    async searchModels(query = '') {
        this.showLoading();
        
        try {
            const url = query 
                ? `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=20`
                : 'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20';
            
            const response = await fetch(url);
            const models = await response.json();
            
            this.displayModels(models);
        } catch (error) {
            console.error('Error fetching models:', error);
            this.modelsContainer.innerHTML = '<p style="color: white; text-align: center;">Error loading models. Please try again.</p>';
        } finally {
            this.hideLoading();
        }
    }

    displayModels(models) {
        if (!models || models.length === 0) {
            this.modelsContainer.innerHTML = '<p style="color: white; text-align: center;">No models found.</p>';
            return;
        }

        this.modelsContainer.innerHTML = models.map(model => `
            <div class="model-card">
                <h3>${model.modelId || 'Unnamed Model'}</h3>
                <p><strong>Downloads:</strong> ${model.downloads ? model.downloads.toLocaleString() : 0}</p>
                <p><strong>Likes:</strong> ${model.likes || 0}</p>
                ${model.tags ? `
                    <div class="model-tags">
                        ${model.tags.slice(0, 5).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                ${model.pipeline_tag ? `<p><strong>Type:</strong> ${model.pipeline_tag}</p>` : ''}
            </div>
        `).join('');
    }

    showLoading() {
        this.loadingElement.classList.remove('hidden');
        this.modelsContainer.innerHTML = '';
    }

    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }
}

// Глобальные функции для кнопок
function searchModels() {
    const query = document.getElementById('searchInput').value;
    app.searchModels(query);
}

function loadPopularModels() {
    document.getElementById('searchInput').value = '';
    app.searchModels();
}

// Enter key support
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchModels();
    }
});

// Инициализация при загрузке страницы
const app = new HuggingFaceApp();
document.addEventListener('DOMContentLoaded', function() {
    app.searchModels(); // Загружаем популярные модели при старте
});
