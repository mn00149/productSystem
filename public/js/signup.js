const form = document.getElementById('form')
const usernameInput = document.getElementById('username')
const departmentInput = document.getElementById('department')
const roleInput = document.getElementById('role')
const emailInput = document.getElementById('email')
const employeeNumberInput = document.getElementById('employeeNumber')
const passwordInput = document.getElementById('password')
const password2Input = document.getElementById('password2')

function checkPasswordMatch(input1, input2) {
    const re = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if (re.test(input1.value)) {
        showError(input1, 'password는 특수 문자 제외 입니다')
        return false
    }
    if (input1.value !== input2.value) {
        showError(input2, 'password가 일치 하지 않습니다')
        return false
    }
    return true
}

function getFeildName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1)
}

function feilNameToKorea(getFeildName){
    switch(getFeildName){
        case 'Username':answer = '이름';
        break;
        case 'Department':answer = '부서명';
        break;
        case 'Role': '직책';
        break;
        case 'EmployeeNumber':answer = '사번';
        break;
        case 'Password2':answer = 'Confirm Password';
        break;
        default:answer = getFeildName
    }
    return answer
}

function checkRequired(inputArr) {
    let result = true;
    inputArr.forEach(input => {
        if (input.value.trim() === "") {
            showError(input, `${feilNameToKorea(getFeildName(input))} 은(는) 입력 하셔야 합니다`)
            result = false
        } else {
            showSuccess(input)
        }
    });
    return result

}

function checkLength(input, min, max) {
    let feildName = getFeildName(input)
    if (input.value.length < min) {
        showError(input, `${feilNameToKorea(feildName)} 은(는) 최소 ${min}글자 이상입니다`)
        return false
    } else if (input.value.length > max) {
        showError(input, `${feilNameToKorea(feildName)} 은(는) 최대 ${max}글자 이하입니다`)
        return false
    } else {
        showSuccess(input)
        return true
    }
    
}

function checkEmail(input) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(input.value.trim())) {
        showSuccess(input);
        return true
    } else {
        showError(input, 'Email is not valid');
        return false
    }
}

function showError(input, message) {
    const inputForm = input.parentElement
    inputForm.className = "input-form error"
    const small = inputForm.querySelector('small')
    small.innerText = message
}

function showSuccess(input) {
    const inputForm = input.parentElement
    inputForm.className = "input-form success"
}

$("#signupBtn").click(function () {
    let username = $('#username').val();
    let password = $('#password').val();
    let email = $('#email').val();
    let department = $('#department').val();
    let employeeNumber = $('#employeeNumber').val();
    let role = $('#role').val();
    employeeNumber = Number(employeeNumber);
    let data = { username, password, email, department, employeeNumber, role };
    let isRequired = checkRequired([usernameInput, emailInput, passwordInput, password2Input, employeeNumberInput, departmentInput, roleInput])
    let isValidLegthPassword = checkLength(passwordInput, 4, 15)
    let isValidEmail = checkEmail(emailInput)
    let isMatchedPassword = checkPasswordMatch(passwordInput, password2Input)


    if (isRequired && isMatchedPassword && isValidEmail && isValidLegthPassword) {
        alert('실행')
        $.post("/users/signup", data)
            .done((res) => {
                alert(res.message)
                location.href = "/signinForm";
            })
            .fail((res) => {
                alert(res.responseJSON.message)
                console.log(res)
            })
    }
});