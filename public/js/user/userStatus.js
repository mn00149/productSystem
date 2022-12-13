$(document).ready(function(){
    $('#move-userStatus').css('border-bottom', '3px solid black')
    $('#move-userStatus').css('font-weight', 'bold')
    $('#move-userStatus').css('font-size', '15px')
})

$('#return-btn').click(function(){
    const productCode = $(this).val();
    $.post('/products/return', {productCode})
    .done((res) => {
        Swal.fire({
            title: "반납성공",
            html: '성공적으로 반납 되었습니다',
            showConfirmButton: false,
            icon: 'success'
        })

        setTimeout(() => {location.reload()}, 1500);
    })
    .fail((res) => {
        Swal.fire({
            title: "반납실패",
            html: res.responseJSON.message,
            icon: 'error'
        })
    })
})