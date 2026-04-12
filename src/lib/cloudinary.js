export async function compressImage(file, maxWidth = 900, quality = 0.78) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = Math.round((maxWidth / w) * h);
                    w = maxWidth;
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, 'image/jpeg', quality);
            };
            img.onerror = () => reject(new Error('Image logic error'));
        };
        reader.onerror = error => reject(error);
    });
}

export async function uploadToCloudinary(file, { folder = 'listing-images', onProgress }) {
    try {
        const compressedBlob = await compressImage(file);
        
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary environment variables missing.');
        }

        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', compressedBlob, file.name || 'upload.jpg');
            formData.append('upload_preset', uploadPreset);
            formData.append('folder', folder);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const pct = Math.round((event.loaded / event.total) * 100);
                    onProgress(pct);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const secureUrl = response.secure_url;
                    const optimizedUrl = secureUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
                    resolve(optimizedUrl);
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText} - ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));

            xhr.send(formData);
        });
    } catch (err) {
        throw err;
    }
}
