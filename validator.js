// Đối tượng Validator
const Validator = (options) => {
  let selectorRules = {};

  const validate = (inputElement, rule) => {
    const errorElement = inputElement.parentElement.querySelector(
      options.errorSelector
    );
    let errorMessage;

    // Lấy tất cả các rule của từng selector
    let rules = selectorRules[rule.selector];

    // Lặp qua từng rule & kiểm tra
    // Nếu xuất hiện error message thì dừng việc kiểm tra
    for (let i = 0; i < rules.length; ++i) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    return !errorMessage;
  };

  const formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit form
    formElement.onsubmit = (e) => {
      e.preventDefault();

      let isFormValid = true;

      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule);
        if(!isValid) {
          isFormValid = false;
        }
      })

      if(isFormValid) {
        // Trường hợp submit với JS
        if(typeof options.onSubmit === "function") {
          let enabledInputs = formElement.querySelectorAll("[name]:not([disable])");
          // convert NodeList sang Array
          let formData = Array.from(enabledInputs).reduce((data, input) => {
            return {
              ...data,
              [input.name]: input.value
            }
          }, {}); 

          options.onSubmit(formData)
        }
        // Trường hợp submit với hành vi mặc định của HTML

      }
    };

    // Lặp qua mỗi rule và xử lý (Lắng nghe sự kiện: blur, input, ...)
    options.rules.forEach((rule) => {
      // Lưu lại các rule cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        // Bắt lỗi khi nhập sai yêu cầu
        inputElement.onblur = () => {
          validate(inputElement, rule);
        };

        // Xóa lỗi khi sửa input
        inputElement.oninput = () => {
          const errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
          );
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
        };
      }
    });
  }
};

// Định nghĩa các rules
// Nguyên tắc viết rule:
// 1. Khi có lỗi trả về message lỗi
// 2. Khi hợp lệ trả về undefined
Validator.isRequired = (selector, message) => {
  return {
    selector,
    test(value) {
      // Dùng trim() đề phòng TH user chỉ nhập mỗi dấu cách cũng hợp lệ
      return value.trim() ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = (selector, message) => {
  return {
    selector,
    test(value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Vui lòng nhập email hợp lệ";
    },
  };
};

Validator.minLength = (selector, min, message) => {
  return {
    selector,
    test(value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = (selector, getConfirmedValue, message) => {
  return {
    selector,
    test(value) {
      return value === getConfirmedValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
      // Custom message lỗi
    },
  };
};
