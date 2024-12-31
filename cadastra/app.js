// Elementos DOM
const elements = {
    form: document.getElementById('eventoForm'),
    fotoInput: document.getElementById('fotoEvento'),
    cropperContainer: document.querySelector('.cropper-wrap-box'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    submitButton: document.getElementById('submitButton'),
    alertContainer: document.getElementById('alertContainer')
};

let cropper = null;

// Funções auxiliares
const showLoading = () => {
    elements.loadingSpinner.classList.remove('d-none');
    elements.submitButton.disabled = true;
    elements.submitButton.querySelector('.spinner-border').classList.remove('d-none');
};

const hideLoading = () => {
    elements.loadingSpinner.classList.add('d-none');
    elements.submitButton.disabled = false;
    elements.submitButton.querySelector('.spinner-border').classList.add('d-none');
};

const showAlert = (message, type = 'success') => {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    elements.alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
};

// Inicialização do Cropper
const initializeCropper = (image) => {
    if (cropper) {
        cropper.destroy();
    }

    elements.cropperContainer.innerHTML = '';
    elements.cropperContainer.appendChild(image);

    cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        zoomable: false,
        scalable: false
    });
};

// Handler para mudança de arquivo
elements.fotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAlert('Por favor, selecione apenas arquivos de imagem.', 'danger');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const image = document.createElement('img');
        image.src = event.target.result;
        image.onload = () => initializeCropper(image);
    };
    reader.readAsDataURL(file);
});

// Upload da imagem para o Firebase Storage
const uploadImage = async (imageBlob) => {
    const uniqueFileName = `fotoEvento_${new Date().getTime()}.png`;
    const storageRef = firebase.storage().ref(`${new Date().getFullYear()}/${appConfig.cliente}/${uniqueFileName}`);
    
    try {
        const snapshot = await storageRef.put(imageBlob);
        return await snapshot.ref.getDownloadURL();
    } catch (error) {
        console.error('Erro no upload da imagem:', error);
        throw new Error('Falha ao fazer upload da imagem');
    }
};

// Preparação dos dados do evento
const prepareEventData = (formData, imageUrl) => {
    return {
        data: new Date(`${formData.data}T${formData.hora}:00`).getTime(),
        foto: appConfig.imagemPadrao,
        flyer: imageUrl,
        descricao: formData.descricao,
        promocao: formData.promocao,
        regra: formData.regra,
        buttonTitle: formData.buttonTitle || appConfig.defaultButtonTitle,
        club: formData.club,
        apelido: appConfig.defaultApelido,
        status: appConfig.defaultStatus,
        whats: appConfig.defaultWhatsapp,
        link: null // Será atualizado após obter a referência do evento
    };
};

// Salvar evento no Firebase
const saveEvent = async (eventData) => {
    const eventosRef = firebase.database().ref(`${appConfig.cliente}/eventos`);
    const eventoRef = eventosRef.push();
    
    // Atualiza o link com a referência gerada
    eventData.link = `https://lista.inovabar.com.br/?p=inovabar/eventos/${eventoRef.key}`;
    
    await eventoRef.set(eventData);
    return eventoRef.key;
};

// Handler para submissão do formulário
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!elements.form.checkValidity()) {
        e.stopPropagation();
        elements.form.classList.add('was-validated');
        return;
    }

    try {
        showLoading();

        // Coleta dados do formulário
        const formData = {
            data: document.getElementById('dataEvento').value,
            hora: document.getElementById('horaEvento').value,
            descricao: document.getElementById('descricao').value,
            promocao: document.getElementById('promocao').value,
            regra: document.getElementById('regra').value,
            buttonTitle: document.getElementById('buttonTitle').value,
            club: document.getElementById('clubCheckbox').checked
        };

        // Verifica se há uma imagem selecionada e cortada
        if (!cropper) {
            throw new Error('Por favor, selecione uma imagem para o flyer');
        }

        // Obtém a imagem cortada
        const canvas = cropper.getCroppedCanvas();
        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // Upload da imagem
        const imageUrl = await uploadImage(imageBlob);

        // Prepara e salva os dados do evento
        const eventData = prepareEventData(formData, imageUrl);
        await saveEvent(eventData);

        showAlert('Evento cadastrado com sucesso!');
        elements.form.reset();
        elements.form.classList.remove('was-validated');
        
        // Limpa o cropper
        if (cropper) {
            cropper.destroy();
            elements.cropperContainer.innerHTML = '<div class="cropper-placeholder">Selecione uma imagem para começar</div>';
        }

    } catch (error) {
        console.error('Erro ao cadastrar evento:', error);
        showAlert(error.message || 'Erro ao cadastrar evento. Por favor, tente novamente.', 'danger');
    } finally {
        hideLoading();
    }
});
