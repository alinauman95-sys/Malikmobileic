import React, { useState, useMemo } from 'react';
import { Cpu, Search, HelpCircle, ArrowRight, ShieldCheck, Zap, Camera, X, Loader2 } from 'lucide-react';

interface DecoderResult {
  manufacturer: string;
  type: string;
  capacity: string;
  confidence: 'High' | 'Medium' | 'Low';
  details?: string;
}

export const ICDecoder: React.FC = () => {
  const [partNumber, setPartNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [aiResult, setAiResult] = useState<any>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    setAiResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCapturing(false);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    
    setIsScanning(true);
    try {
      const response = await fetch('/api/decode-ic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      const data = await response.json();
      
      if (data.partNumber && data.partNumber !== 'NOT_FOUND') {
        setPartNumber(data.partNumber);
        setAiResult(data);
      } else if (data.capacity || data.manufacturer) {
        setAiResult(data);
        setPartNumber(''); // Clear manual PN if AI found other details but no PN
      } else {
        alert("Could not read IC markings. Try again with a clearer picture.");
      }
    } catch (err) {
      console.error("Scan error:", err);
      alert("Failed to scan. Check your internet connection.");
    } finally {
      setIsScanning(false);
    }
  };

  const result = useMemo<DecoderResult | null>(() => {
    const pn = partNumber.trim().toUpperCase();
    
    if (!pn) {
      if (aiResult) {
        return {
          manufacturer: aiResult.manufacturer || 'Unknown',
          type: aiResult.type || 'IC Chip',
          capacity: aiResult.capacity || 'Unknown',
          confidence: 'Medium',
          details: 'Decoded using AI Vision. (آرٹیفیشل انٹیلیجنس کے ذریعے پہچان)'
        };
      }
      return null;
    }

    // --- SAMSUNG DECODER (eMMC, UFS, NAND, eMCP) ---
    if (pn.startsWith('KLM') || pn.startsWith('KLU') || pn.startsWith('KMG') || pn.startsWith('K9') || pn.startsWith('KM')) {
      let type = 'eMMC';
      if (pn.startsWith('KLU') || pn.startsWith('KMG')) type = 'UFS';
      if (pn.startsWith('K9')) type = 'NAND Flash';
      if (pn.startsWith('KMR') || pn.startsWith('KMQ') || pn.startsWith('KMD')) type = 'eMCP (NAND + RAM)';

      let capacity = 'Unknown';
      
      // Density Map (Character at 4th position usually)
      // 2=2GB, 4=4GB, 8=8GB, A=16GB, B=32GB, C=64GB, D=128GB, E=256GB, F=512GB, G=1TB, H=2TB, J=4TB
      // For KMR/KMQ, sometimes it's the 4th char too
      const densityChar = pn.length > 3 ? pn[3] : '';
      const densityMap: Record<string, string> = {
        '2': '2 GB',
        '4': '4 GB',
        '8': '8 GB',
        'A': '16 GB',
        'B': '32 GB',
        'C': '64 GB',
        'D': '128 GB',
        'E': '256 GB',
        'F': '512 GB',
        'G': '1 TB',
        'H': '2 TB',
        'J': '4 TB',
      };

      if (densityMap[densityChar]) {
        capacity = densityMap[densityChar];
      } 
      
      // K9 Series (NAND Flash) specific density bits
      if (pn.startsWith('K9')) {
        if (pn.includes('KAG')) capacity = '2 GB';
        if (pn.includes('LBG')) capacity = '4 GB';
        if (pn.includes('GCG')) capacity = '8 GB';
        if (pn.includes('HDG')) capacity = '16 GB';
        if (pn.includes('WAG')) capacity = '32 GB';
        if (pn.includes('UAG')) capacity = '64 GB';
      }

      // KMR Series (eMCP) density overrides if pattern matches
      if (pn.startsWith('KMR31')) capacity = '16 GB';
      if (pn.startsWith('KMRX1')) capacity = '32 GB';

      if (capacity === 'Unknown') {
        const directGB = pn.match(/(\d+)[GT]/);
        if (directGB) capacity = `${directGB[1]} ${directGB[0].includes('T') ? 'TB' : 'GB'}`;
      }

      return {
        manufacturer: 'Samsung',
        type,
        capacity,
        confidence: capacity !== 'Unknown' ? 'High' : 'Low',
        details: `Samsung ${type} identified. Character '${densityChar}' or pattern indicates ${capacity}.`
      };
    }

    // --- SK HYNIX DECODER ---
    if (pn.startsWith('H26') || pn.startsWith('H28') || pn.startsWith('H9') || pn.startsWith('H27')) {
      let type = 'eMMC';
      if (pn.startsWith('H28')) type = 'UFS';
      if (pn.startsWith('H9')) type = 'eMCP (NAND + RAM)';
      if (pn.startsWith('H27')) type = 'NAND Flash';

      let capacity = 'Unknown';
      const densityDigit = pn.length > 4 ? pn[4] : '';
      
      const hDensityMap: Record<string, string> = {
        '2': '2 GB',
        '3': '4 GB',
        '4': '8 GB',
        '5': '16 GB',
        '6': '32 GB',
        '7': '64 GB',
        '8': '128 GB',
        '9': '256 GB',
        'C': '256 GB',
        'D': '512 GB',
        'A': '512 GB',
        'B': '1 TB',
      };

      if (hDensityMap[densityDigit]) {
        capacity = hDensityMap[densityDigit];
      }

      // Expanded H9 eMCP logic
      if (pn.startsWith('H9TQ17')) capacity = '16 GB';
      if (pn.startsWith('H9TQ26')) capacity = '32 GB';
      if (pn.startsWith('H9TQ64')) capacity = '64 GB';
      if (pn.startsWith('H9TQ52')) capacity = '32 GB'; // Common variant
      if (pn.startsWith('H9HQ16')) capacity = '128 GB';
      if (pn.startsWith('H9HQ53')) capacity = '128 GB';
      if (pn.startsWith('H9HKNN')) capacity = 'RAM Only (LPDDR)';

      return {
        manufacturer: 'SK Hynix',
        type,
        capacity,
        confidence: capacity !== 'Unknown' ? 'High' : 'Low',
        details: `SK Hynix ${type} identified. Digit '${densityDigit}' in sequence indicates ${capacity}.`
      };
    }

    // --- KINGSTON DECODER ---
    if (pn.startsWith('EMMC')) {
      const match = pn.match(/EMMC(\d+)/);
      const cap = match ? `${match[1]} GB` : 'Identify via Suffix';
      return {
        manufacturer: 'Kingston',
        type: 'eMMC',
        capacity: cap,
        confidence: match ? 'High' : 'Medium',
        details: 'Kingston eMMC. The number following "EMMC" directly states the capacity in GB.'
      };
    }

    // --- FORESEE DECODER ---
    if (pn.startsWith('FEM') || pn.startsWith('NCEM')) {
      const match = pn.match(/(\d+)G/);
      const cap = match ? `${parseInt(match[1])} GB` : 'Search Datasheet';
      return {
        manufacturer: 'Foresee (Longsys)',
        type: 'eMMC / NAND',
        capacity: cap,
        confidence: match ? 'High' : 'Medium',
        details: 'Foresee memory chip. Look for the numerical density (e.g., 004G, 016G, 32G) in the number.'
      };
    }

    // --- MICRON DECODER ---
    if (pn.startsWith('MT')) {
      let capacity = 'Identify via FBGA';
      const densities = ['2G', '4G', '8G', '16G', '32G', '64G', '128G', '256G', '512G', '1T'];
      for (const d of densities) {
        if (pn.includes(d)) {
          capacity = d.replace('G', ' GB').replace('T', ' TB');
          break;
        }
      }

      // MT29 Series often uses bits
      if (pn.startsWith('MT29F')) {
        if (pn.includes('128G')) capacity = '16 GB'; // 128G bits = 16GB
        if (pn.includes('256G')) capacity = '32 GB';
        if (pn.includes('512G')) capacity = '64 GB';
      }

      return {
        manufacturer: 'Micron',
        type: 'Flash / DRAM',
        capacity,
        confidence: capacity.includes('GB') ? 'High' : 'Medium',
        details: 'Micron part identified. Look for density marks like 64G, 128G. Note: Micron often marks in BITS (8 bits = 1 Byte).'
      };
    }

    // --- SANDISK ---
    if (pn.startsWith('SDIN') || pn.startsWith('SDTN')) {
      let capacity = 'Search Suffix';
      const suffixes = ['-2G', '-4G', '-8G', '-16G', '-32G', '-64G', '-128G', '-256G', '-512G'];
      for (const s of suffixes) {
        if (pn.includes(s)) {
          capacity = s.replace('-', '').replace('G', ' GB');
          break;
        }
      }

      return {
        manufacturer: 'Sandisk',
        type: 'eMMC / UFS',
        capacity,
        confidence: capacity.includes('GB') ? 'High' : 'Low',
        details: 'Sandisk/Western Digital IC. Capacity is usually listed at the end of the number (e.g., -32G).'
      };
    }

    // --- TOSHIBA / KIOXIA ---
    if (pn.startsWith('THGB') || pn.startsWith('THNS')) {
      let capacity = 'Identify via 5th/6th char';
      // THGBM 5=4GB, 6=8GB, 7=16GB, 8=32GB, 9=64GB, A0=128GB, A1=256GB
      if (pn.includes('M5G5')) capacity = '4 GB';
      if (pn.includes('M5G6')) capacity = '8 GB';
      if (pn.includes('M5G7')) capacity = '16 GB';
      if (pn.includes('M5G8')) capacity = '32 GB';
      if (pn.includes('M5G9')) capacity = '64 GB';
      if (pn.includes('MAG0')) capacity = '128 GB';
      if (pn.includes('MAG1')) capacity = '256 GB';

      return {
        manufacturer: 'Toshiba / Kioxia',
        type: 'eMMC / UFS',
        capacity,
        confidence: capacity.includes('GB') ? 'High' : 'Medium',
        details: 'Toshiba THGB series. The character after G usually indicates density.'
      };
    }

    // --- QUALCOMM CPU ---
    if (pn.startsWith('MSM') || pn.startsWith('SDM') || pn.startsWith('SM') || pn.startsWith('APQ')) {
      let details = 'Qualcomm Snapdragon CPU.';
      if (pn.startsWith('MSM89')) details += ' Common in mid-range older phones.';
      if (pn.startsWith('SM8')) details += ' High-end Flagship processor.';
      
      return {
        manufacturer: 'Qualcomm',
        type: 'Processor (CPU)',
        capacity: 'N/A',
        confidence: 'High',
        details
      };
    }

    // --- MEDIATEK CPU ---
    if (pn.startsWith('MT') && (pn.match(/MT\d{4}/) || pn.startsWith('MTK'))) {
      return {
        manufacturer: 'MediaTek',
        type: 'Processor (CPU)',
        capacity: 'N/A',
        confidence: 'High',
        details: 'MediaTek chipset identified. Extremely common in budget and mid-range devices.'
      };
    }

    // --- EXYNOS CPU ---
    if (pn.startsWith('EXYNOS') || pn.match(/S5E\d{4}/)) {
      return {
        manufacturer: 'Samsung Exynos',
        type: 'Processor (CPU)',
        capacity: 'N/A',
        confidence: 'High',
        details: 'Samsung proprietary Exynos processor.'
      };
    }

    // --- HISILICON (KIRIN) CPU ---
    if (pn.startsWith('HI') || pn.startsWith('KIRIN')) {
      return {
        manufacturer: 'HiSilicon (Huawei)',
        type: 'Processor (CPU)',
        capacity: 'N/A',
        confidence: 'High',
        details: 'HiSilicon Kirin processor. Exclusively found in Huawei and Honor devices.'
      };
    }

    // --- UNISOC / SPREADTRUM CPU ---
    if (pn.startsWith('SC') || pn.startsWith('UMS') || pn.startsWith('UNISOC')) {
      return {
        manufacturer: 'Unisoc / Spreadtrum',
        type: 'Processor (CPU)',
        capacity: 'N/A',
        confidence: 'High',
        details: 'Unisoc chipset. Very common in modern budget phones and tablets.'
      };
    }

    // --- BROADCOM ---
    if (pn.startsWith('BCM')) {
      return {
        manufacturer: 'Broadcom',
        type: 'Connectivity / CPU',
        capacity: 'N/A',
        confidence: 'Medium',
        details: 'Broadcom chip. Usually handles Wi-Fi/Bluetooth or used as a main CPU in older devices.'
      };
    }

    // --- VOLTAGE REGULATORS ---
    if (pn.match(/^(LM)?(78|79)\d{2}/) || pn.startsWith('AMS1117') || pn.startsWith('LM317')) {
      let details = 'Voltage Regulator.';
      let output = 'Variable';
      
      if (pn.includes('7805')) output = '5V';
      if (pn.includes('7812')) output = '12V';
      if (pn.includes('1117-3.3')) output = '3.3V';
      if (pn.includes('1117-5.0')) output = '5V';
      
      return {
        manufacturer: 'Various (ST, TI, ON)',
        type: 'Voltage Regulator',
        capacity: output,
        confidence: 'High',
        details: `${details} Output: ${output}. Extremely common in power supplies and scrap circuit boards.`
      };
    }

    // --- LOGIC GATES (74 / 40 Series) ---
    if (pn.match(/^(74|CD40|HEF40|MC140)/)) {
      let type = 'Logic IC';
      if (pn.match(/74.*00/)) type = 'NAND Gate (Quad)';
      if (pn.match(/74.*04/)) type = 'Inverter (Hex)';
      if (pn.match(/74.*08/)) type = 'AND Gate (Quad)';
      if (pn.match(/74.*32/)) type = 'OR Gate (Quad)';
      if (pn.match(/74.*595/)) type = 'Shift Register';
      if (pn.match(/74.*244/)) type = 'Buffer / Driver';
      
      return {
        manufacturer: 'Various (TI, NXP, Fairchild)',
        type,
        capacity: 'Logic',
        confidence: 'High',
        details: 'Standard Logic Series IC. Foundation of digital electronics.'
      };
    }

    // --- PMIC (Power Management) ---
    if (pn.startsWith('PM') || pn.startsWith('PMI') || pn.startsWith('MT63') || pn.startsWith('MAX7')) {
      return {
        manufacturer: 'Various (Qualcomm, MediaTek, Maxim)',
        type: 'Power Management (PMIC)',
        capacity: 'N/A',
        confidence: 'High',
        details: 'Power Management Integrated Circuit. Controls battery charging and system voltages.'
      };
    }

    // --- COMMUNICATION / INTERFACE ---
    if (pn.startsWith('MAX232') || pn.startsWith('CH340') || pn.startsWith('CP210') || pn.startsWith('PL2303')) {
      return {
        manufacturer: 'Various (Maxim, WCH, Silicon Labs)',
        type: 'Interface / USB-Serial',
        capacity: 'N/A',
        confidence: 'High',
        details: 'Interface bridge IC. Common in networking gear and programming cables.'
      };
    }

    // --- EEPROM / SPI FLASH ---
    if (pn.match(/^(24C|25Q|W25Q|24L|AT24)/)) {
      let capacity = 'Identify via Suffix';
      if (pn.includes('24C02')) capacity = '256 Bytes';
      if (pn.includes('24C04')) capacity = '512 Bytes';
      if (pn.includes('24C08')) capacity = '1 KB';
      if (pn.includes('24C16')) capacity = '2 KB';
      if (pn.includes('24C32')) capacity = '4 KB';
      if (pn.includes('24C64')) capacity = '8 KB';
      if (pn.includes('25Q32')) capacity = '4 MB';
      if (pn.includes('25Q64')) capacity = '8 MB';
      if (pn.includes('25Q128')) capacity = '16 MB';

      return {
        manufacturer: 'Various (Atmel, Winbond, ST)',
        type: 'EEPROM / SPI Flash',
        capacity,
        confidence: 'High',
        details: 'Non-volatile memory for configuration and firmware.'
      };
    }

    // --- AUDIO ---
    if (pn.startsWith('TDA') || pn.startsWith('LM386') || pn.startsWith('PAM')) {
      return {
        manufacturer: 'Various (NXP, TI, PAM)',
        type: 'Audio Amplifier',
        capacity: 'Watts Var.',
        confidence: 'High',
        details: 'Audio processing or amplification IC. Found in TV boards, speakers, and car stereos.'
      };
    }

    return null;
  }, [partNumber, aiResult]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-6 pb-24 transition-colors duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 dark:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Universal IC Decoder</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Identify Memory, CPUs, Logic & Power ICs (آئی سی ڈی کوڈر)</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            Enter IC Part Number (آئی سی نمبر لکھیں)
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              placeholder="e.g. KLMAG2GEAC, 74HC595, LM7805..."
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono font-bold uppercase transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={startCamera}
              disabled={isScanning}
              className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
              title="Capture Image"
            >
              {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Camera Overlay */}
        {isCapturing && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-indigo-400 border-dashed rounded-lg flex items-center justify-center">
                  <div className="w-48 h-24 border-2 border-white/50 rounded flex items-center justify-center">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Place IC Here</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={stopCamera}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-white text-sm font-medium text-center">Focus on the text written on the IC</p>
              <button
                onClick={captureImage}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform bg-white/10"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-lg" />
              </button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {result ? (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Decode Results</span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                result.confidence === 'High' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' :
                result.confidence === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {result.confidence} Confidence
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <span className="text-xs text-indigo-400 dark:text-indigo-500 font-bold uppercase">Manufacturer</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{result.manufacturer}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <span className="text-xs text-indigo-400 dark:text-indigo-500 font-bold uppercase">Memory Type</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {result.type}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-600 dark:bg-indigo-700 rounded-xl shadow-md">
                <span className="text-xs text-indigo-200 dark:text-indigo-300 font-bold uppercase">Storage Capacity</span>
                <span className="text-xl font-black text-white">{result.capacity}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50">
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed italic">
                {result.details}
              </p>
            </div>
          </div>
        ) : partNumber.length > 2 ? (
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No match found</p>
              <p className="text-xs text-slate-400 dark:text-slate-600">Try checking the prefix or full number.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-indigo-50 dark:border-indigo-900/30 border-dashed flex items-center gap-3 text-indigo-400 dark:text-indigo-600">
             <div className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-600 animate-pulse" />
             <p className="text-xs font-medium">Ready to decode... (ڈی کوڈ کرنے کے لیے نمبر لکھیں)</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <div className="w-1.5 h-4 bg-indigo-600 dark:bg-indigo-700 rounded-full" />
          Quick Reference Guide
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 block mb-2 uppercase">Mobile & Memory</span>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between"><span>KLM<span className="text-indigo-600 dark:text-indigo-400 font-bold">C</span>... / KMR...</span> <span className="font-bold text-slate-800 dark:text-slate-200">64GB (Sam)</span></div>
              <div className="flex justify-between"><span>H26M<span className="text-indigo-600 dark:text-indigo-400 font-bold">7</span>... / H9TQ...</span> <span className="font-bold text-slate-800 dark:text-slate-200">64GB (Hynix)</span></div>
              <div className="flex justify-between"><span>EMMC32G / FEM...032G</span> <span className="font-bold text-slate-800 dark:text-slate-200">32GB (King/Fore)</span></div>
              <div className="flex justify-between"><span>SDIN / MT29F...</span> <span className="font-bold text-slate-800 dark:text-slate-200">Flash Storage</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 block mb-2 uppercase">General Purpose</span>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between"><span>7805 / 7812</span> <span className="font-bold text-slate-800 dark:text-slate-200">Regulator</span></div>
              <div className="flex justify-between"><span>74HCxx / CD40xx</span> <span className="font-bold text-slate-800 dark:text-slate-200">Logic Gate</span></div>
              <div className="flex justify-between"><span>PM / PMI series</span> <span className="font-bold text-slate-800 dark:text-slate-200">PMIC</span></div>
              <div className="flex justify-between"><span>TDA / LM386</span> <span className="font-bold text-slate-800 dark:text-slate-200">Audio Amp</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50 transition-colors duration-500">
        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase mb-1">Notice</p>
        <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-relaxed">
          Part numbers can vary by generation. This tool provides estimations based on common patterns. Always verify with official manufacturer datasheets when possible.
        </p>
      </div>
    </div>
  );
};
