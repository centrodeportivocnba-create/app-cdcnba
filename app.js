let posts = JSON.parse(localStorage.getItem('cnba_posts')) || [
    {
        id: 1,
        type: 'normal',
        title: 'Actividades con Normalidad',
        description: 'Las instalaciones del campo de deportes se encuentran operativas en horario habitual.',
        timestamp: '13 de Octubre, 08:00 hs',
        image: null
    }
];

let config = JSON.parse(localStorage.getItem('cnba_config')) || {
    appName: 'Colegio Nacional de Buenos Aires',
    logoUrl: null
};

// LISTA DE ADMINISTRADORES AUTORIZADOS
// Puedes cambiar los nombres y las contraseñas a tu gusto aquí mismo
const ADMIN_USERS = [
    { user: "rodrigo", pass: "clave123" },
    { user: "admin2", pass: "deportes2026" }
];

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    renderApp();
});

function renderApp() {
    // Aplicar identidad institucional
    document.getElementById('appNameTitle').innerText = config.appName;
    if (config.logoUrl) {
        document.getElementById('headerLogoImg').src = config.logoUrl;
        document.getElementById('headerLogoImg').classList.remove('hidden');
        document.getElementById('logoPlaceholderText').classList.add('hidden');
    } else {
        document.getElementById('headerLogoImg').classList.add('hidden');
        document.getElementById('logoPlaceholderText').classList.remove('hidden');
    }

    // Renderizar estado actual (último post)
    if (posts.length > 0) {
        const latest = posts[0];
        document.getElementById('statusTitleText').innerText = latest.title;
        document.getElementById('statusDescText').innerText = latest.description;
        document.getElementById('statusTimestamp').innerText = latest.timestamp;
        
        const dot = document.getElementById('statusIndicatorDot');
        dot.className = 'w-4 h-4 rounded-full shrink-0 ' + getStatusColorClass(latest.type);
    }

    // Renderizar listado de avisos
    const container = document.getElementById('postsContainer');
    document.getElementById('postCount').innerText = `${posts.length} avisos`;
    
    if (posts.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-400 text-sm py-8">No hay novedades publicadas.</p>`;
        return;
    }

    container.innerHTML = posts.map((post) => `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full ${getStatusColorClass(post.type)}"></span>
                    <span class="text-xs font-bold uppercase text-slate-700">${post.title}</span>
                </div>
                <span class="text-xs text-slate-400">${post.timestamp}</span>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-3">${post.description}</p>
            ${post.image ? `<div class="mb-3 rounded-xl overflow-hidden border border-slate-100 max-h-64"><img src="${post.image}" class="w-full h-full object-cover"></div>` : ''}
            ${isAdminLoggedIn() ? `<div class="text-right pt-2 border-t border-slate-100"><button onclick="deletePost(${post.id})" class="text-xs text-red-500 hover:underline">Eliminar aviso</button></div>` : ''}
        </div>
    `).join('');
}

function getStatusColorClass(type) {
    switch(type) {
        case 'normal': return 'bg-emerald-500';
        case 'jso': return 'bg-amber-500';
        case 'suspended': return 'bg-rose-500';
        default: return 'bg-slate-500';
    }
}

function getStatusTitle(type) {
    switch(type) {
        case 'normal': return 'Actividades Normales';
        case 'jso': return 'Lluvia - Modalidad JSO';
        case 'suspended': return 'Actividades Suspendidas';
        default: return 'Aviso General';
    }
}

// Control del Modal Admin
function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        if (isAdminLoggedIn()) {
            document.getElementById('adminLoginView').classList.add('hidden');
            document.getElementById('adminDashboardView').classList.remove('hidden');
            document.getElementById('configAppName').value = config.appName;
        } else {
            document.getElementById('adminLoginView').classList.remove('hidden');
            document.getElementById('adminDashboardView').classList.add('hidden');
            document.getElementById('adminUserInput').value = '';
            document.getElementById('adminPasswordInput').value = '';
        }
    }
}

function verifyPassword() {
    const userInput = document.getElementById('adminUserInput').value.trim().toLowerCase();
    const passInput = document.getElementById('adminPasswordInput').value;

    // Buscar si coincide con alguno de los administradores permitidos
    const validAdmin = ADMIN_USERS.find(admin => admin.user === userInput && admin.pass === passInput);

    if (validAdmin) {
        sessionStorage.setItem('cnba_admin_auth', 'true');
        sessionStorage.setItem('cnba_current_user', validAdmin.user);
        document.getElementById('adminLoginView').classList.add('hidden');
        document.getElementById('adminDashboardView').classList.remove('hidden');
        document.getElementById('configAppName').value = config.appName;
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('cnba_admin_auth') === 'true';
}

function logoutAdmin() {
    sessionStorage.removeItem('cnba_admin_auth');
    sessionStorage.removeItem('cnba_current_user');
    toggleAdminModal();
}

function switchAdminTab(tab) {
    if (tab === 'post') {
        document.getElementById('adminTabPost').classList.remove('hidden');
        document.getElementById('adminTabConfig').classList.add('hidden');
        document.getElementById('tabPostBtn').className = 'flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-sm transition';
        document.getElementById('tabConfigBtn').className = 'flex-1 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition';
    } else {
        document.getElementById('adminTabPost').classList.add('hidden');
        document.getElementById('adminTabConfig').classList.remove('hidden');
        document.getElementById('tabConfigBtn').className = 'flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-sm transition';
        document.getElementById('tabPostBtn').className = 'flex-1 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition';
    }
}

// Publicar actualización
function publishUpdate() {
    const type = document.getElementById('newStatusType').value;
    const desc = document.getElementById('newStatusDesc').value.trim();
    const imageInput = document.getElementById('newStatusImage');

    if (!desc) {
        alert('Por favor, escribe una descripción para la novedad.');
        return;
    }

    const now = new Date();
    const timestamp = now.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) + ', ' + now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveNewPost(type, desc, timestamp, e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveNewPost(type, desc, timestamp, null);
    }
}

function saveNewPost(type, description, timestamp, imageUrl) {
    const newPost = {
        id: Date.now(),
        type: type,
        title: getStatusTitle(type),
        description: description,
        timestamp: timestamp,
        image: imageUrl
    };

    posts.unshift(newPost);
    localStorage.setItem('cnba_posts', JSON.stringify(posts));
    
    document.getElementById('newStatusDesc').value = '';
    document.getElementById('newStatusImage').value = '';
    toggleAdminModal();
    renderApp();
    alert('¡Actualización publicada con éxito!');
}

function deletePost(id) {
    if (confirm('¿Estás seguro de eliminar este aviso?')) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('cnba_posts', JSON.stringify(posts));
        renderApp();
    }
}

function saveConfiguration() {
    const newName = document.getElementById('configAppName').value.trim();
    if (newName) config.appName = newName;

    const logoFile = document.getElementById('configLogoFile');
    if (logoFile.files && logoFile.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            config.logoUrl = e.target.result;
            localStorage.setItem('cnba_config', JSON.stringify(config));
            toggleAdminModal();
            renderApp();
            alert('Configuración guardada correctamente');
        };
        reader.readAsDataURL(logoFile.files[0]);
    } else {
        localStorage.setItem('cnba_config', JSON.stringify(config));
        toggleAdminModal();
        renderApp();
        alert('Configuración guardada correctamente');
    }
}
