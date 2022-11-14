$('#move-productRegister').click(function () {
    $.get('/products/register')
        .done(() => {
            location.href = "/products/register"
        })
})

$('#move-productManage').click(function () {
    $.get('/products/manage')
        .done(() => {
            location.href = "/products/manage"
        })
})

$('#move-userStatus').click(function () {
    $.get('/users/status')
        .done(() => {
            location.href = "/users/status"
        })
        .fail((res) => {
            alert(res.responseJSON.message)
        })
})

$('#move-rentalList').click(function () {
    $.get('/products/rentalList')
        .done(() => {
            location.href = "/products/rentalList"
        })
        .fail((res) => {
            alert(res.responseJSON.message)
        })
})

$('#move-userManage').click(function () {
    $.get('/users/manage')
        .done(() => {
            location.href = "/users/manage"
        })
        .fail((res) => {
            alert(res.responseJSON.message)
        })
})
