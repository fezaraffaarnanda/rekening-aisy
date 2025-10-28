// Global variables
let currentQRISData = null;
const QRIS_STATIC =
  "00020101021126610014COM.GO-JEK.WWW01189360091437835039020210G7835039020303UMI51440014ID.CO.QRIS.WWW0215ID10254368649590303UMI5204899953033605802ID5925AISYAH AZIZAH NUR RAHMAH,6011PURBALINGGA61055338162070703A0163047FA6";

// CRC16 calculation function (converted from PHP)
function convertCRC16(str) {
  function charCodeAt(str, i) {
    return str.charCodeAt(i);
  }

  let crc = 0xffff;
  const strlen = str.length;

  for (let c = 0; c < strlen; c++) {
    crc ^= charCodeAt(str, c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  let hex = (crc & 0xffff).toString(16).toUpperCase();
  if (hex.length === 3) hex = "0" + hex;
  return hex;
}

// Convert static QRIS to dynamic QRIS (converted from PHP)
function convertQRISToDynamic(staticQRIS, amount) {
  // Remove last 4 characters (CRC)
  let qris = staticQRIS.substring(0, staticQRIS.length - 4);

  // Replace static indicator with dynamic indicator
  let step1 = qris.replace("010211", "010212");

  // Split by "5802ID"
  let parts = step1.split("5802ID");

  // Format amount: "54" + length (2 digits) + amount
  let amountStr = amount.toString();
  let formattedAmount =
    "54" + amountStr.length.toString().padStart(2, "0") + amountStr;

  // Reconstruct QRIS
  let dynamicQRIS = parts[0] + formattedAmount + "5802ID" + parts[1];

  // Calculate and append CRC16
  dynamicQRIS += convertCRC16(dynamicQRIS);

  return dynamicQRIS;
}

function showQRIS() {
  document.getElementById("qrisModal").style.display = "block";
  // Langsung tampilkan QR code
  const qrisImageElement = document.getElementById("qrisImage");
  qrisImageElement.src = "qris-aisy.jpg";
  qrisImageElement.classList.remove("dynamic");
  document.getElementById("statusMessage").innerHTML = "";
}

function closeQRIS() {
  document.getElementById("qrisModal").style.display = "none";
}

async function downloadQRIS() {
  // download static qris
  const link = document.createElement("a");
  link.href = "qris-aisy.jpg";
  link.download = "QRIS-Aisyah.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("QRIS berhasil didownload!", "success");
}

function copyToClipboard(number, bank) {
  navigator.clipboard
    .writeText(number)
    .then(() => {
      showToast(`${bank} ${number} berhasil disalin!`, "success");
    })
    .catch(() => {
      // fallback untuk browser lama
      const textArea = document.createElement("textarea");
      textArea.value = number;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast(`${bank} ${number} berhasil disalin!`, "success");
    });
}

function showToast(message, type = "default") {
  // hapus toast yang sudah ada
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  // buat toast baru
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // tambahkan icon berdasarkan type
  let icon;
  if (type === "success") {
    icon = `<svg class="copy-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  } else if (type === "error") {
    icon = `<svg class="copy-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
  } else {
    icon = `<svg class="copy-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
  }

  toast.innerHTML = `${icon}${message}`;
  document.body.appendChild(toast);

  // hapus toast setelah 3 detik
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// format number dengan ribuan
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// parse formatted number ke numeric value
function parseFormattedNumber(formatted) {
  return parseInt(formatted.replace(/\./g, ""));
}

// format input value ke real-time
function formatAmountInput(input) {
  let value = input.value.replace(/\./g, ""); // hapus titik yang sudah ada
  value = value.replace(/[^0-9]/g, ""); // hanya angka

  if (value) {
    input.value = formatNumber(value);
  } else {
    input.value = "";
  }
}

// close modal ketika klik di luar
window.onclick = function (event) {
  const modal = document.getElementById("qrisModal");
  if (event.target === modal) {
    closeQRIS();
  }
};

// close modal ketika tekan escape
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeQRIS();
  }
});
