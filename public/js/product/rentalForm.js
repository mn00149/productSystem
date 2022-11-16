$('#rental-btn').click(function () {
    const productCode = $('#product-code').text()
    const issuedate = $('#rental-start').val()
    const duedate = $('#rental-end').val()
    const reason = $('#reason-input').val()
    const data = { productCode, issuedate, duedate, reason }

    $.post('/products/rent', data)
        .done((res) => {
            console.log(res)
            Swal.fire({
                title: '대여 성공',
                text: res.message,
                showConfirmButton: false,
                icon: 'success'
            }
            )
            opener.document.getElementById('chkEdit').value = '1'
            setTimeout(() => { window.close() }, 2000)

        })
        .fail((res) => {
            Swal.fire({
                title: '대여 실패',
                text: res.responseJSON.message,
                icon: 'error'
            }
            )
        })
})

$("#cancle-btn").click(function () {
    self.close()
})

let now_utc = Date.now() // 지금 날짜를 밀리초로
// getTimezoneOffset()은 현재 시간과의 차이를 분 단위로 반환
let timeOff = new Date().getTimezoneOffset() * 60000; // 분단위를 밀리초로 변환
// new Date(today-timeOff).toISOString()은 '2022-05-11T18:09:38.134Z'를 반환
let today = new Date(now_utc - timeOff).toISOString().substring(0, 16);
//document.getElementsByClassName("date-local").setAttribute("min", today);
$('.date-local').attr('min', today)