$('.reset-password-btn').click(function() {
    const employeeNumber = $(this).val()
    $.post('/users/resetPassword', {employeeNumber})
     .done((res) => {
        alert('패스워드가 초기화 되었습니다')
     })
     .fail((res) => {
        alert(res.responseJSON.message)
     })
})

$('.delete-user-btn').click(function() {
    const employeeNumber = $(this).val()
    $.post('/users/delete', {employeeNumber})
     .done((res) => {
        alert('유저가 추방 되었습니다')
     })
     .fail((res) => {
        alert(res.responseJSON.message)
     })
})

