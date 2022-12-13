let popupEmployeeNum = $('#popup-employeeNumber')
let employeeNumber = ''

$(document).ready(function(){
   $('#move-userManage').css('border-bottom', '3px solid black')
   $('#move-userManage').css('font-weight', 'bold')
   $('#move-userManage').css('font-size', '15px')
})

$('.reset-password-btn').on('click', function() {
   let employeeNumber = $(this).val()
   $.post('/users/resetPassword', {employeeNumber})
    .done((res) => {
      Swal.fire({
         title: "Password reset",
         text: '패스워드가 초기화 되었습니다',
         icon: 'success',
         showConfirmButton: false,
         timer: 2000
      })
    })
    .fail((res) => {
      Swal.fire({
         title:"초기화 실패",
         text:res.responseJSON.message,
         icon:'error'
      })
    })
})

$('.delete-user-btn').click(function() {
    const employeeNumber = $(this).val()
    const count = $(this).children().val()
    Swal.fire({
      title: `<strong style="color:red ;" >${employeeNumber}</strong> 추방`,
      html: `해당 유저는 현재<strong style="color:red ;"> ${count}</strong>개의 물품을 대여중입니다. <br/>추방 하시겠습니까?`,
      icon: 'warning',
      
      showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
      confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
      cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
      confirmButtonText: '추방', // confirm 버튼 텍스트 지정
      cancelButtonText: '취소', // cancel 버튼 텍스트 지정
      reverseButtons: true, // 버튼 순서 거꾸로
      
   }).then(result => {
      // 만약 Promise리턴을 받으면,
      if (result.isConfirmed) { // 만약 모달창에서 confirm 버튼을 눌렀다면
         $.post('/users/delete', {employeeNumber})
         .done(() => {
            Swal.fire({
               title: '유저 추방',
               text:'유저가 추방 되었습니다',
               icon:'success',
               showConfirmButton:false
            })
            setTimeout(() => {location.reload()}, 1500)
            
         })
         .fail((res) => {
            Swal.fire({
               title:'추방실패',
               text:res.responseJSON.message,
               icon:'error'
            })
         })
      }
   });

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
    .fail((res) => {
      Swal.fire({
         title:'에러발생',
         text:res.responseJSON.message,
         icon:'error'
      })
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
      Swal.fire({
         title: '수정 성공',
         text:'권한이 수정 되었습니다',
         icon: 'success',
         showConfirmButton: false
      })
      setTimeout(() => {location.reload()}, 1500)
      
   })
   .fail(() => {
      Swal.fire({
         title: '수정실패',
         text: "수정에 실패 하였습니다 관리자에게 문의 바랍니다",
         icon: 'error'
      })
   })

   close()
 })

 document.querySelector("#close").addEventListener("click", function(){
   close()
   $('input[type="checkbox"][name="right"]').prop('checked', false);
 });



