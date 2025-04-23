//This section demonstrates how to grab DOM Elements for manipulation
const form = document.getElementById('resourceForm');
const resourcesList = document.getElementById("resourcesList");
const counter = document.getElementById('counter');
const searchInput = document.querySelector('.search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

//This section demonstrates how to handle state management in Javascript
let resources = JSON.parse(localStorage.getItem('resources')) || [];
let currentFilter = "all";
let searchTerm = '';

//This section demonstrates how we should initialize our Javascript application
function init(){
    loadFromLocalStorage();
    renderResources();
    bindEvents();
    updateCounter();
}

// In this section we demonstrate how to bind events in JS
function bindEvents(){
    form.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    resourcesList.addEventListener('click', handleResourceClick);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
}

//This section demonstrates how to handle events in JS
function handleFormSubmit(e){
    e.preventDefault();

    const formData = new FormData(form);
    const resource = {
        name: formData.get('resourceName') ? formData.get('resourceName').trim() : '',
        type: formData.get('resourceType') || '',
        location: formData.get('resourceLocation') ? formData.get('resourceLocation').trim() : '',
        id: Date.now().toString(),
        dateAdded: new Date().toLocaleDateString()
    };
    
    if(validateForm(resource)){
        addResource(resource);
        form.reset();
        clearErrors();
        showNotification('Resource added successfully!');
    }
}

//This section demonstrates how to implement form validation in JS
function validateForm(resource){
    let isValid = true;
    
    if(!resource.name){
        showError('nameError', 'Resource name is required');
        isValid = false;
    }
    
    if(!resource.type){
        showError('typeError', 'Resource type is required');
        isValid = false;
    }
    
    if(!resource.location){
        showError('locationError', 'Resource location is required');
        isValid = false;
    }
    
    return isValid;
}

function showError(elementId, message){
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors(){
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

//This section demonstrates how we implement the functionality for rendering and filtering of resources
function renderResources(){
    let filteredResources = filterResources(resources, currentFilter, searchTerm);
    
    if (filteredResources.length === 0) {
        resourcesList.innerHTML = '<div class="no-resources">No resources found</div>';
        return;
    }
    
    resourcesList.innerHTML = filteredResources.map(resource =>
        `
        <div class="resource-card" data-type="${resource.type}">
            <button class="delete-btn" data-id="${resource.id}">&times;</button>
            <h3>${resource.name}</h3>
            <p class="meta">
                <span class="type">${getTypeIcon(resource.type)} ${resource.type}</span>
                <span class="location">📍 Zone ${resource.location}</span>
            </p>
            <small>Added: ${resource.dateAdded}</small>
        </div>
        `
    ).join('');
}

function filterResources(resources, filterType, searchTerm){
    return resources.filter(resource => {
        // Handle "other" filter type
        let matchesFilter = false;
        if (filterType === "all") {
            matchesFilter = true;
        } else if (filterType === "other") {
            matchesFilter = !["water", "food", "medical"].includes(resource.type.toLowerCase());
        } else {
            matchesFilter = resource.type.toLowerCase() === filterType.toLowerCase();
        }
        
        const matchesSearch = !searchTerm ||
            resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.location.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });
}

// Handle search functionality
function handleSearch(e) {
    searchTerm = e.target.value;
    renderResources();
}

// Handle resource click events (delete)
function handleResourceClick(e) {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this resource?')) {
            deleteResource(id);
        }
    }
}

function deleteResource(id) {
    resources = resources.filter(resource => resource.id !== id);
    saveToLocalStorage();
    renderResources();
    updateCounter();
    showNotification('Resource deleted successfully!');
}

// Get icon based on resource type
function getTypeIcon(type) {
    const icons = {
        'water': '💧',
        'food': '🍲',
        'medical': '🩺',
        'equipment': '🔧',
        'personnel': '👤',
        'vehicle': '🚗',
        'building': '🏢',
        'supply': '📦'
    };
    return icons[type.toLowerCase()] || '📍';
}

// Update resource counter
function updateCounter() {
    counter.textContent = resources.length;
}

// Add new resource
function addResource(resource) {
    resources.push(resource);
    saveToLocalStorage();
    renderResources();
    updateCounter();
}

// Handle filter button clicks
function handleFilter(e) {
    currentFilter = e.target.dataset.filter || "all";
    
    // Update active button styling
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    renderResources();
}

// Load resources from localStorage
function loadFromLocalStorage() {
    try {
        const storedResources = localStorage.getItem('resources');
        if (storedResources) {
            resources = JSON.parse(storedResources);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showNotification('Failed to load saved data', 'error');
        resources = [];
    }
}

// Save to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('resources', JSON.stringify(resources));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showNotification('Failed to save data', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);