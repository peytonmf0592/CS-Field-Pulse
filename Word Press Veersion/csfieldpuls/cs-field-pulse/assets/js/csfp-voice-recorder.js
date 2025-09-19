/**
 * CS Field Pulse Voice Recorder
 */

class CSFPVoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.recordingStartTime = null;
        this.recordingTimer = null;
    }
    
    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            return false;
        }
    }
    
    async startRecording() {
        if (this.isRecording) return;
        
        if (!this.stream) {
            const initialized = await this.init();
            if (!initialized) {
                alert('Unable to access microphone. Please check your permissions.');
                return;
            }
        }
        
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream);
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };
        
        this.mediaRecorder.onstop = () => {
            this.onRecordingStop();
        };
        
        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.startTimer();
        
        this.updateUI('recording');
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.stopTimer();
        this.updateUI('stopped');
    }
    
    onRecordingStop() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create audio element for playback
        const audioElement = document.createElement('audio');
        audioElement.src = audioUrl;
        audioElement.controls = true;
        
        // Update UI with audio player - try multiple container IDs
        const previewContainer = document.getElementById('voice-preview') || 
                               document.getElementById('visit-voice-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
            previewContainer.appendChild(audioElement);
        }
        
        // Store blob for upload
        this.currentBlob = audioBlob;
    }
    
    async uploadRecording(inspectorId, caption = '') {
        if (!this.currentBlob) {
            alert('No recording to upload');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'csfp_upload_media');
        formData.append('nonce', csfp_ajax.nonce);
        formData.append('inspector_id', inspectorId);
        formData.append('media_type', 'voice');
        formData.append('caption', caption);
        
        // Create a file from the blob
        const fileName = `voice_recording_${Date.now()}.webm`;
        const file = new File([this.currentBlob], fileName, { type: 'audio/webm' });
        formData.append('file', file);
        
        try {
            const response = await jQuery.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            });
            
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.data || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
    
    startTimer() {
        // Try multiple timer element IDs for different contexts
        const timerElement = document.getElementById('recording-timer') || 
                           document.getElementById('visit-recording-timer');
        if (!timerElement) return;
        
        this.recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timerElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }
    
    updateUI(state) {
        const recordBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const uploadBtn = document.getElementById('upload-recording');
        const statusElement = document.getElementById('recording-status');
        
        switch (state) {
            case 'recording':
                if (recordBtn) recordBtn.disabled = true;
                if (stopBtn) stopBtn.disabled = false;
                if (uploadBtn) uploadBtn.disabled = true;
                if (statusElement) {
                    statusElement.textContent = 'Recording...';
                    statusElement.className = 'csfp-recording-active';
                }
                break;
                
            case 'stopped':
                if (recordBtn) recordBtn.disabled = false;
                if (stopBtn) stopBtn.disabled = true;
                if (uploadBtn) uploadBtn.disabled = false;
                if (statusElement) {
                    statusElement.textContent = 'Recording complete';
                    statusElement.className = 'csfp-recording-complete';
                }
                break;
                
            default:
                if (recordBtn) recordBtn.disabled = false;
                if (stopBtn) stopBtn.disabled = true;
                if (uploadBtn) uploadBtn.disabled = true;
                if (statusElement) {
                    statusElement.textContent = 'Ready to record';
                    statusElement.className = '';
                }
        }
    }
    
    reset() {
        this.audioChunks = [];
        this.currentBlob = null;
        this.updateUI('ready');
        
        // Try multiple preview container IDs
        const previewContainer = document.getElementById('voice-preview') || 
                               document.getElementById('visit-voice-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        // Try multiple timer element IDs
        const timerElement = document.getElementById('recording-timer') || 
                           document.getElementById('visit-recording-timer');
        if (timerElement) {
            timerElement.textContent = '00:00';
        }
    }
    
    destroy() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.reset();
    }
}

// Initialize recorder when needed
window.CSFPVoiceRecorder = CSFPVoiceRecorder;