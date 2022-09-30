export default function imageToBase64(src: string) {
    let image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = src;
    
    return new Promise((res : (value: Uint8Array) => void, rej: (message: string)=> void)=>{
        image.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = image.height;
            canvas.width = image.width;
            ctx.drawImage(image, 0, 0);
            const dataURL = canvas.toDataURL()
            const bin = b64tobin(dataURL.split(',')[1])
            res(bin)
        };
        image.onerror = function(){
            rej("could not load the image")
        }
    })
}

const b64tobin = (b64Data : string) => {
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return byteArray
}