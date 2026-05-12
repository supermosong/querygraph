// ExportButton.jsx — downloads the current chart as a PNG image
import React from 'react';

// Finds the chart SVG in the DOM, converts it to a PNG canvas, and triggers download
function ExportButton({ title }) {
  function handleExport() {
    const svg = document.querySelector('.recharts-wrapper svg');
    if (!svg) return;

    const svgData   = new XMLSerializer().serializeToString(svg);
    const svgBlob   = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url       = URL.createObjectURL(svgBlob);
    const img       = new Image();

    img.onload = () => {
      const canvas  = document.createElement('canvas');
      const scale   = 2; // retina quality
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);

      // Watermark
      ctx.font      = '12px sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.textAlign = 'right';
      ctx.fillText('querygraph.app', canvas.width / scale - 10, canvas.height / scale - 10);

      URL.revokeObjectURL(url);
      const link  = document.createElement('a');
      link.download = `${title || 'chart'}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = url;
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-1.5 text-sm bg-white border border-gray-300 text-gray-600
                 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
    >
      Export PNG
    </button>
  );
}

export default ExportButton;
