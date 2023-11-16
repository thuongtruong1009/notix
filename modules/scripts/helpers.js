export const calLastUpdate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    if(day === NaN || month === NaN || year === NaN) return "unknown";
    return formattedDate;
}

export const exportToImage = (cb) => {
    domtoimage.toPng(main).then(async(dataUrl) => {
        cb(dataUrl);
    }).catch((error) => { 
        alert('oops, something went wrong!', error);
    });
}
