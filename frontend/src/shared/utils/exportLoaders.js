

export async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  return window.jspdf.jsPDF;
}

export async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  return window.XLSX;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src     = src;
    script.onload  = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
