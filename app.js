// Variables globales
let equiposData = [];
let filteredData = [];
let currentEditIndex = -1;
let currentDeleteIndex = -1;

// Definir las columnas según el Excel
const COLUMNS = [
    'No',
    'ID',
    'NOMBRE DEL EQUIPO',
    'Modelo',
    'No. SERIE',
    'FABRICANTE',
    'RANGO',
    'UBICACION',
    'RESPONSIBLE',
    'Fecha de calibracion',
    'VENCIMIENTO CALIBRACIÓN',
    'Precio $',
    'VENCIMIENTO CALIBRACIÓN A 2 ANOS',
    'Etiqueta',
    'Certificado',
    'PRP5',
    'Interno / Externo',
    'Notas'
];

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos desde localStorage si existen
    loadFromLocalStorage();
    
    // Event listener para búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            filteredData = [...equiposData];
        } else {
            filteredData = equiposData.filter(equipo => {
                return (
                    (equipo.ID || '').toString().toLowerCase().includes(searchTerm) ||
                    (equipo['NOMBRE DEL EQUIPO'] || '').toLowerCase().includes(searchTerm) ||
                    (equipo['No. SERIE'] || '').toLowerCase().includes(searchTerm) ||
                    (equipo.FABRICANTE || '').toLowerCase().includes(searchTerm)
                );
            });
        }
        renderTable();
    });
});

// Cargar archivo Excel
function loadExcelFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Leer la primera hoja
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convertir a JSON, empezando desde la fila 4 (índice 3)
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                range: 3, // Empezar desde la fila 4 (0-indexed, por eso es 3)
                header: COLUMNS,
                defval: ''
            });
            
            equiposData = jsonData.map((item, index) => {
                // Asegurar que No sea consecutivo
                item.No = index + 1;
                return item;
            });
            
            filteredData = [...equiposData];
            
            // Guardar en localStorage
            saveToLocalStorage();
            
            // Actualizar la interfaz
            renderTable();
            updateStats();
            populateFilterOptions();
            
            alert(`✅ Archivo cargado exitosamente: ${equiposData.length} registros`);
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            alert('❌ Error al leer el archivo Excel. Verifica el formato.');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Guardar en localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('equiposCalibration', JSON.stringify(equiposData));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

// Cargar desde localStorage
function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('equiposCalibration');
        if (data) {
            equiposData = JSON.parse(data);
            filteredData = [...equiposData];
            renderTable();
            updateStats();
            populateFilterOptions();
        }
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
    }
}

// Renderizar tabla
function renderTable() {
    const tbody = document.getElementById('tableBody');
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="19" class="empty-state">
                    <div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 100px; height: 100px; margin-bottom: 20px; opacity: 0.5;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3>No se encontraron resultados</h3>
                        <p>Intenta con otro criterio de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredData.forEach((equipo, index) => {
        const row = document.createElement('tr');
        
        // Calcular estado de calibración
        const estado = calcularEstado(equipo['VENCIMIENTO CALIBRACIÓN']);
        
        row.innerHTML = `
            <td>${equipo.No || ''}</td>
            <td>${equipo.ID || ''}</td>
            <td>${equipo['NOMBRE DEL EQUIPO'] || ''}</td>
            <td>${equipo.Modelo || ''}</td>
            <td>${equipo['No. SERIE'] || ''}</td>
            <td>${equipo.FABRICANTE || ''}</td>
            <td>${equipo.RANGO || ''}</td>
            <td>${equipo.UBICACION || ''}</td>
            <td>${equipo.RESPONSIBLE || ''}</td>
            <td>${formatDate(equipo['Fecha de calibracion'])}</td>
            <td>${formatDate(equipo['VENCIMIENTO CALIBRACIÓN'])}</td>
            <td>${equipo['Precio $'] || ''}</td>
            <td>${formatDate(equipo['VENCIMIENTO CALIBRACIÓN A 2 ANOS'])}</td>
            <td>${equipo.Etiqueta || ''}</td>
            <td>${equipo.Certificado || ''}</td>
            <td>${equipo.PRP5 || ''}</td>
            <td>${equipo['Interno / Externo'] || ''}</td>
            <td>${equipo.Notas || ''}</td>
            <td><span class="status-badge status-${estado}">${estado.toUpperCase()}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Calcular estado de calibración
function calcularEstado(fechaVencimiento) {
    if (!fechaVencimiento) return 'sin-fecha';
    
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'vencido';
    if (diffDays <= 30) return 'proximo';
    return 'vigente';
}

// Formatear fecha
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Actualizar estadísticas
function updateStats() {
    const total = equiposData.length;
    let vigentes = 0;
    let proximos = 0;
    let vencidos = 0;
    
    equiposData.forEach(equipo => {
        const estado = calcularEstado(equipo['VENCIMIENTO CALIBRACIÓN']);
        if (estado === 'vigente') vigentes++;
        else if (estado === 'proximo') proximos++;
        else if (estado === 'vencido') vencidos++;
    });
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statVigente').textContent = vigentes;
    document.getElementById('statProximo').textContent = proximos;
    document.getElementById('statVencido').textContent = vencidos;
}

// Poblar opciones de filtros
function populateFilterOptions() {
    // Ubicaciones únicas
    const ubicaciones = [...new Set(equiposData.map(e => e.UBICACION).filter(Boolean))];
    const selectUbicacion = document.getElementById('filterUbicacion');
    selectUbicacion.innerHTML = '<option value="">Todas</option>';
    ubicaciones.sort().forEach(ub => {
        selectUbicacion.innerHTML += `<option value="${ub}">${ub}</option>`;
    });
    
    // PRP5 únicos
    const prp5s = [...new Set(equiposData.map(e => e.PRP5).filter(Boolean))];
    const selectPRP5 = document.getElementById('filterPRP5');
    selectPRP5.innerHTML = '<option value="">Todos</option>';
    prp5s.sort().forEach(prp => {
        selectPRP5.innerHTML += `<option value="${prp}">${prp}</option>`;
    });
}

// Toggle filtros
function toggleFilters() {
    const container = document.getElementById('filtersContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

// Aplicar filtros
function applyFilters() {
    const ubicacion = document.getElementById('filterUbicacion').value;
    const prp5 = document.getElementById('filterPRP5').value;
    const tipo = document.getElementById('filterTipo').value;
    const estado = document.getElementById('filterEstado').value;
    
    filteredData = equiposData.filter(equipo => {
        let match = true;
        
        if (ubicacion && equipo.UBICACION !== ubicacion) match = false;
        if (prp5 && equipo.PRP5 !== prp5) match = false;
        if (tipo && equipo['Interno / Externo'] !== tipo) match = false;
        if (estado) {
            const estadoEquipo = calcularEstado(equipo['VENCIMIENTO CALIBRACIÓN']);
            if (estadoEquipo !== estado) match = false;
        }
        
        return match;
    });
    
    renderTable();
}

// Generar formulario
function generateForm(containerId, data = {}) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const fields = [
        { name: 'ID', type: 'text', required: true },
        { name: 'NOMBRE DEL EQUIPO', type: 'text', required: true },
        { name: 'Modelo', type: 'text' },
        { name: 'No. SERIE', type: 'text' },
        { name: 'FABRICANTE', type: 'text' },
        { name: 'RANGO', type: 'text' },
        { name: 'UBICACION', type: 'text' },
        { name: 'RESPONSIBLE', type: 'text' },
        { name: 'Fecha de calibracion', type: 'date' },
        { name: 'VENCIMIENTO CALIBRACIÓN', type: 'date' },
        { name: 'Precio $', type: 'number' },
        { name: 'VENCIMIENTO CALIBRACIÓN A 2 ANOS', type: 'date' },
        { name: 'Etiqueta', type: 'text' },
        { name: 'Certificado', type: 'text' },
        { name: 'PRP5', type: 'text' },
        { name: 'Interno / Externo', type: 'select', options: ['', 'Interno', 'Externo'] },
        { name: 'Notas', type: 'textarea', fullWidth: true }
    ];
    
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = field.fullWidth ? 'form-group full-width' : 'form-group';
        
        const label = document.createElement('label');
        label.textContent = field.name + (field.required ? ' *' : '');
        formGroup.appendChild(label);
        
        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
        } else if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }
        
        input.id = `field_${field.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
        input.value = data[field.name] || '';
        if (field.required) input.required = true;
        
        formGroup.appendChild(input);
        container.appendChild(formGroup);
    });
}

// Abrir modal nuevo
function openNewModal() {
    generateForm('formNew');
    document.getElementById('modalNew').style.display = 'block';
}

// Guardar nuevo
function saveNew() {
    const newEquipo = {};
    
    COLUMNS.slice(1).forEach(col => { // Excluir 'No' porque es auto-generado
        const fieldId = `field_${col.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const element = document.getElementById(fieldId);
        if (element) {
            newEquipo[col] = element.value;
        }
    });
    
    // Validar campos requeridos
    if (!newEquipo.ID || !newEquipo['NOMBRE DEL EQUIPO']) {
        alert('⚠️ Por favor completa los campos obligatorios (ID y Nombre del Equipo)');
        return;
    }
    
    // Asignar número consecutivo
    newEquipo.No = equiposData.length + 1;
    
    // Agregar a la lista
    equiposData.push(newEquipo);
    filteredData = [...equiposData];
    
    // Guardar y actualizar
    saveToLocalStorage();
    renderTable();
    updateStats();
    populateFilterOptions();
    
    closeModal('modalNew');
    alert('✅ Equipo agregado exitosamente');
}

// Abrir modal actualizar
function openUpdateModal() {
    document.getElementById('updateFormContainer').style.display = 'none';
    document.getElementById('btnUpdate').style.display = 'none';
    document.getElementById('updateSearch').value = '';
    document.getElementById('modalUpdate').style.display = 'block';
}

// Buscar para actualizar
function searchForUpdate() {
    const searchTerm = document.getElementById('updateSearch').value.toLowerCase();
    if (!searchTerm) {
        alert('⚠️ Ingresa un ID o Nombre para buscar');
        return;
    }
    
    const index = equiposData.findIndex(e => 
        (e.ID || '').toString().toLowerCase() === searchTerm ||
        (e['NOMBRE DEL EQUIPO'] || '').toLowerCase().includes(searchTerm)
    );
    
    if (index === -1) {
        alert('❌ No se encontró el equipo');
        return;
    }
    
    currentEditIndex = index;
    generateForm('formUpdate', equiposData[index]);
    document.getElementById('updateFormContainer').style.display = 'block';
    document.getElementById('btnUpdate').style.display = 'block';
}

// Guardar actualización
function saveUpdate() {
    if (currentEditIndex === -1) return;
    
    const updatedEquipo = { No: equiposData[currentEditIndex].No };
    
    COLUMNS.slice(1).forEach(col => {
        const fieldId = `field_${col.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const element = document.getElementById(fieldId);
        if (element) {
            updatedEquipo[col] = element.value;
        }
    });
    
    // Validar campos requeridos
    if (!updatedEquipo.ID || !updatedEquipo['NOMBRE DEL EQUIPO']) {
        alert('⚠️ Por favor completa los campos obligatorios');
        return;
    }
    
    equiposData[currentEditIndex] = updatedEquipo;
    filteredData = [...equiposData];
    
    saveToLocalStorage();
    renderTable();
    updateStats();
    
    closeModal('modalUpdate');
    alert('✅ Equipo actualizado exitosamente');
}

// Abrir modal eliminar
function openDeleteModal() {
    document.getElementById('deleteInfo').style.display = 'none';
    document.getElementById('btnDelete').style.display = 'none';
    document.getElementById('deleteSearch').value = '';
    document.getElementById('modalDelete').style.display = 'block';
}

// Buscar para eliminar
function searchForDelete() {
    const searchTerm = document.getElementById('deleteSearch').value.toLowerCase();
    if (!searchTerm) {
        alert('⚠️ Ingresa un ID o Nombre para buscar');
        return;
    }
    
    const index = equiposData.findIndex(e => 
        (e.ID || '').toString().toLowerCase() === searchTerm ||
        (e['NOMBRE DEL EQUIPO'] || '').toLowerCase().includes(searchTerm)
    );
    
    if (index === -1) {
        alert('❌ No se encontró el equipo');
        return;
    }
    
    currentDeleteIndex = index;
    const equipo = equiposData[index];
    
    document.getElementById('deleteInfo').innerHTML = `
        <h3 style="color: #991b1b; margin-bottom: 15px;">⚠️ ¿Confirmar eliminación?</h3>
        <p><strong>ID:</strong> ${equipo.ID}</p>
        <p><strong>Nombre:</strong> ${equipo['NOMBRE DEL EQUIPO']}</p>
        <p><strong>Modelo:</strong> ${equipo.Modelo}</p>
        <p><strong>Ubicación:</strong> ${equipo.UBICACION}</p>
        <p style="margin-top: 15px; color: #991b1b;"><strong>Esta acción no se puede deshacer</strong></p>
    `;
    
    document.getElementById('deleteInfo').style.display = 'block';
    document.getElementById('btnDelete').style.display = 'block';
}

// Confirmar eliminación
function confirmDelete() {
    if (currentDeleteIndex === -1) return;
    
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return;
    
    equiposData.splice(currentDeleteIndex, 1);
    
    // Reajustar números consecutivos
    equiposData.forEach((eq, index) => {
        eq.No = index + 1;
    });
    
    filteredData = [...equiposData];
    
    saveToLocalStorage();
    renderTable();
    updateStats();
    
    closeModal('modalDelete');
    alert('✅ Equipo eliminado exitosamente');
}

// Cerrar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentEditIndex = -1;
    currentDeleteIndex = -1;
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        currentEditIndex = -1;
        currentDeleteIndex = -1;
    }
}

// Descargar Excel
function downloadExcel() {
    if (equiposData.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }
    
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para el Excel
    const wsData = [
        ['Listado de calibracion de equipos'], // Fila 1
        [], // Fila 2
        COLUMNS, // Fila 3 - Headers
        ...equiposData.map(equipo => COLUMNS.map(col => equipo[col] || '')) // Datos
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Ajustar anchos de columna
    const colWidths = COLUMNS.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Calibraciones');
    
    // Generar y descargar archivo
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Calibraciones_${fecha}.xlsx`);
    
    alert('✅ Archivo Excel descargado exitosamente');
}
