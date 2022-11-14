$(document).ready(function(){
    $('#move-rentalList').css('border-bottom', '3px solid black')
    $('#move-rentalList').css('font-weight', 'bold')
    $('#move-rentalList').css('font-size', '15px')
})

function test(e){
    $(e).next().toggleClass('show')
    $(e).children().toggleClass('inline-block')
}   