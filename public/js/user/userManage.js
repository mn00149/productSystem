let popupEmployeeNum = $('#popup-employeeNumber')
let employeeNumber = ''

$(document).ready(function(){
   $('#move-userManage').css('border-bottom', '3px solid black')
   $('#move-userManage').css('font-weight', 'bold')
   $('#move-userManage').css('font-size', '15px')
})

$('.reset-password-btn').on('click', function() {
   let employeeNumber = $(this).val()
   alert('클릭')
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
     .done(() => {
        alert('유저가 추방 되었습니다')
        location.reload()
     })
     .fail((res) => {
        alert(res.responseJSON.message)
     })
})

function show() {
   document.querySelector(".background").className = "background show";
 }

 function close() {
   document.querySelector(".background").className = "background";
 }

 $(".edit-right-btn").click(function(){
   employeeNumber = $(this).val()
   show()
   popupEmployeeNum.text('사번: '+employeeNumber)
   $.get("/users/info/"+employeeNumber)
    .done((res) => {
      res.right.forEach(right => {
         let id = "#" + right
         $(id).prop('checked', true);
      });
    })
 })

 $("#register-rigth").click(function(){
   let chkList = []
   $('input[type="checkbox"][name="right"]:checked').each(function(){
      let chk = $(this).val()
      chkList.push(chk)
   })
   let data = {
      right: chkList,
      employeeNumber:employeeNumber.trim()
   }

   $.post('/users/edit/right', data)
   .done(() => {
      alert('권한이 수정되었습니다')
      location.reload()
   })
   .fail(() => alert("실패"))

   close()
 })

 document.querySelector("#close").addEventListener("click", function(){
   close()
   $('input[type="checkbox"][name="right"]').prop('checked', false);
 });



