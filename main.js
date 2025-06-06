const form = document.getElementById("applyForm");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const submitBtn = document.getElementById("submitBtn");
let selectedFiles = [];

// 字段中文名映射表
const fieldLabels = {
  name: "姓名",
  gender: "性别",
  age: "年龄",
  nationality: "国籍",
  telegram: "Telegram",
  email: "邮箱",
  phone: "手机号",
  position: "应聘岗位",
  salary: "期望薪资",
  salaryType: "薪资类型",
  location: "居住地",
  message: "留言"
};

document.getElementById("customUploadBtn").onclick = () => fileInput.click();
fileInput.addEventListener("change", () => {
  selectedFiles = selectedFiles.concat(Array.from(fileInput.files));
  updateFileList();
  fileInput.value = "";
});

function updateFileList() {
  fileList.innerHTML = "";
  selectedFiles.forEach((file, i) => {
    const name = file.name;
    const displayName = name.length > 25 ? name.slice(0, 10) + "..." + name.slice(-10) : name;
    const li = document.createElement("li");
    li.innerHTML = `${displayName}<button onclick="removeFile(${i})">✖</button>`;
    fileList.appendChild(li);
  });
}

function removeFile(i) {
  selectedFiles.splice(i, 1);
  updateFileList();
}

function closeModal() {
  document.getElementById("successModal").style.display = "none";
}
document.getElementById("successModal").onclick = (e) => {
  if (e.target.id === "successModal") closeModal();
};

function canSubmitNow() {
  const now = Date.now();
  const history = JSON.parse(localStorage.getItem("submitSuccessTimes") || "[]")
    .filter(t => now - t < 3600_000);
  if (history.length >= 10) {
    alert("1 小时内最多提交 10 次，请稍后再试。");
    return false;
  }
  return true;
}

const validators = {
  name: val => val.trim() !== "",
  gender: val => val !== "",
  age: val => val >= 18 && val <= 50,
  nationality: val => val.trim() !== "",
  telegram: val => val.startsWith("@") && val.length > 1,
  salary: val => val.trim() !== "",
  salaryType: () => document.querySelector('input[name="salaryType"]:checked') !== null,
  location: val => val.trim() !== "",
  position: val => val.trim() !== "",
  email: val => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
};

function validateField(name, value) {
  const isValid = validators[name](value);
  const errorEl = document.getElementById(`error-${name}`);
  if (errorEl) {
    errorEl.textContent = isValid ? "" : getErrorMessage(name);
  }
  return isValid;
}

function getErrorMessage(name) {
  const messages = {
    name: "姓名为必填项",
    gender: "性别为必选项",
    age: "年龄必须为 18-50 之间的数字",
    nationality: "国籍为必填项",
    telegram: "填写有效 Telegram 用户名",
    salary: "填写期望薪资",
    salaryType: "请选择期望薪资类型",
    location: "居住地为必填项",
    position: "应聘岗位为必填项",
    email: "邮箱格式不正确",
  };
  return messages[name];
}

window.addEventListener("load", () => {
  Array.from(form.elements).forEach(el => {
    if (el.name && el.type !== "radio" && localStorage.getItem(el.name)) {
      el.value = localStorage.getItem(el.name);
    }
  });
});

Array.from(form.elements).forEach(el => {
  if (el.type !== "radio") {
    el.addEventListener("input", () => {
      if (el.name) localStorage.setItem(el.name, el.value);
    });
  }
  if (el.name in validators) {
    el.addEventListener("blur", () => validateField(el.name, el.value));
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!canSubmitNow()) return;

  let valid = true;
  const data = new FormData(form);
  for (let [name, val] of data.entries()) {
    if (validators[name] && !validateField(name, val)) valid = false;
  }

  if (!validators.salaryType()) {
    document.getElementById("error-salaryType").textContent = getErrorMessage("salaryType");
    valid = false;
  } else {
    document.getElementById("error-salaryType").textContent = "";
  }

  if (!valid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "提交中...";

  const botToken = "8134589361:AAEIO1tHS2asn2AMGKL6O4Pk_Msuxoei6C8";
  const chatId = "7068578771";

  let message = "📩 新的应聘者信息：\n";
  for (let [key, value] of data.entries()) {
    if (key !== "files[]") {
      const label = fieldLabels[key] || key;
      message += `${label}：${value}\n`;
    }
  }

  const salaryType = document.querySelector('input[name="salaryType"]:checked');
  if (salaryType) message += `${fieldLabels.salaryType}：${salaryType.value}\n`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    for (const file of selectedFiles) {
      const fileForm = new FormData();
      fileForm.append("chat_id", chatId);
      fileForm.append("document", file);
      await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: "POST",
        body: fileForm,
      });
    }

    const now = Date.now();
    const successHistory = JSON.parse(localStorage.getItem("submitSuccessTimes") || "[]")
      .filter(t => now - t < 3600_000);
    successHistory.push(now);
    localStorage.setItem("submitSuccessTimes", JSON.stringify(successHistory));

    document.getElementById("successModal").style.display = "flex";
    form.reset();
    selectedFiles = [];
    updateFileList();
    submitBtn.disabled = false;
    submitBtn.textContent = "提交";
    localStorage.clear();

  } catch (err) {
    alert("提交失败，请稍后再试。");
    submitBtn.disabled = false;
    submitBtn.textContent = "提交";
  }
});

document.addEventListener('touchstart', function (e) {
  const active = document.activeElement;
  if (
    active &&
    (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
    !e.target.closest('input') &&
    !e.target.closest('textarea')
  ) {
    active.blur();
  }
});
