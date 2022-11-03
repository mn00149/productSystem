$('#rental-btn').click(function(){
    console.log('클릭')
    const productCode = $('#product-code').text()    
    const issuedate = $('#rental-start').val()
    const duedate = $('#rental-end').val() 
    const reason = $('#reason-input').val()
    const data = {productCode, issuedate, duedate, reason}

    $.post('/products/rent', data)
    .done((res) => {
        alert(res.responseJSON.message)
        window.close()
    })
    .fail((res) => {
        alert(res.responseJSON.message)
    })
})