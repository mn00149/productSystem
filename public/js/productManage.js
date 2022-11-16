let category = []
let productsList = []
let filterdeProductList = []
let filterdeSubProductList = []
let subOptions = {}
let searchBtn = $('#search-btn')
let searchInput = $('#search-input')
let tbody = $('#product-tbody')
let mainCategory = $('#select-main')
let subCategory = $('#select-sub')


function availability(i) {
    if (i == 1) return "O"
    else return "X"
}

// tbody에 들어갈 테이블 생성 함수
function generateTbodyInf(productsList) {
    let product = ""
    for (let i = 0; i < productsList.length; i++) {

        let lending = productsList[i].rentalQuantity
        let left = productsList[i].quantity
        let total = lending + left
        product += `                        
                    <tr>
                        <td>${productsList[i].category.mainCategory}</td>
                        <td>${productsList[i].category.subCategory}</td>
                        <td>
                            <p>물품명: ${productsList[i].productName}</p>
                            <p>코드: ${productsList[i].productCode}</p>
                        </td>
                        <td>
                            <p>총량: ${total}</p>
                            <p>대여중: ${lending}</p>
                            <p>잔여수: ${left}</p>
                        </td>
                        <td>
                            <p>대여가능 여부: ${availability(productsList[i].rentalAvailability)}</p>
                            <p>반납필요 여부: ${availability(productsList[i].returnAvailability)}</p>
                        </td>
                        <td> ${productsList[i].registerDate}</td>
                        <td>
                            <div class="select-btn">
                                <button type="button" id="user-list" value="${productsList[i].productCode}">대여자 목록</button>
                                <button type="button" id="rental-record" value="${productsList[i].productCode}">대여이력</button>
                                ${productsList[i].rentalAvailability ? "<button id=rental-btn type=button value=" + productsList[i].productCode + ">대여</button>" : ""
            }
                                <button id="delete-btn" type="button" value="${productsList[i].productCode}">삭제</button>
                                <button id="edit-btn" type="button" value="${productsList[i].productCode}">수정</button>
                                
                            <div>
                        </td>
                    </tr>
                    `;

    }
    return product
}
// 페이지 로딩시 카테고리와 물품의 모든 정보를 가져옴
$(document).ready(function () {
    //헤더 클릭 처리를 위한 css커트롤
    $('#move-productManage').css('border-bottom', '3px solid black')
    $('#move-productManage').css('font-weight', 'bold')
    $('#move-productManage').css('font-size', '15px')

    $.get('/products/getAll')
        .done((res) => {
            productsList = res
            tbody.empty()
            let tbodyInf = generateTbodyInf(productsList)
            tbody.append(tbodyInf)
        })
        .fail((res) => {
            Swal.fire({
                title: "물품 정보 조회 실패",
                text: res.responseJSON,
                icon: 'error'
            })
        })

    $.get('/category').done((res) => {
        category = res
        for (let i = 0; i < category.length; i++) {
            subOptions[category[i].mainCategory] = category[i].subCategory
            let option = "<option value=" + category[i].mainCategory + ">" + category[i].mainCategory + "</option>"
            mainCategory.append(option)
        }
    }).fail((res) => {
        console.log(res)
        Swal.fire({title:"Error 발생",text:"서버에 오류가 생겼습니다 잠시후 다시 시도해주시길 바랍니다",icon:'error'})
    })
})
//대분류가 바뀌때
mainCategory.change(function () {
    let currentMain = $(this).val()
    let tbodyInf = ''
    if (currentMain == 0) {
        tbodyInf = generateTbodyInf(productsList)
    } else {
        filterdeProductList = productsList.filter((product) => { return product.category.mainCategory == currentMain })
        tbodyInf = generateTbodyInf(filterdeProductList)
    }
    tbody.empty()
    tbody.append(tbodyInf)
    subCategory.empty();
    subCategory.append(`<option value="0">소분류</option>`)
    let subOptionList = subOptions[currentMain]
    if (subOptionList) {
        for (let i = 0; i < subOptionList.length; i++) {
            let option = "<option value=" + subOptionList[i] + ">" + subOptionList[i] + "</option>"
            subCategory.append(option)
        }
    }
})
//소분류가 변경될때
subCategory.change(function () {
    let currentSub = $(this).val()
    let tbodyInf = ''
    console.log(currentSub)
    if (currentSub == 0) {
        tbodyInf = generateTbodyInf(filterdeProductList)
    } else {
        filterdeSubProductList = filterdeProductList.filter((product) => product.category.subCategory == currentSub)
        tbodyInf = generateTbodyInf(filterdeSubProductList)
    }
    tbody.empty()
    tbody.append(tbodyInf)
})
//정렬이 바뀔때 => 반복되는 코드가 많은듯 함수로 줄일 수 있는지 리팩토링시 생각 해 볼것
$('#sorting').change(function () {
    tbody.empty()
    let sortoption = $(this).val()
    let productListNameAsc = []
    let tbodyInf = ''
    if (mainCategory.val() == 0 && subCategory.val() == 0) {//대분류 소분류 선택안함
        if (sortoption == 1) {
            productListNameAsc = productsList.sort((a, b) => a.productName.toLowerCase() < b.productName.toLowerCase() ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        if (sortoption == 2) {
            productListNameAsc = productsList.sort((a, b) => b.productName.toLowerCase() < a.productName.toLowerCase() ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        if (sortoption == 3) {
            productListNameAsc = productsList.sort((a, b) => new Date(a.registerDate) < new Date(b.registerDate) ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        if (sortoption == 4) {
            productListNameAsc = productsList.sort((a, b) => new Date(b.registerDate) < new Date(a.registerDate) ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        else {
            tbodyInf = generateTbodyInf(productsList)
        }
    }
    if (mainCategory.val() != 0 && subCategory.val() == 0) {//대분류 선택 소분류 선택 안함
        if (sortoption == 1) {
            productListNameAsc = filterdeProductList.sort((a, b) => a.productName.toLowerCase() < b.productName.toLowerCase() ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)

        }
        if (sortoption == 2) {
            tbody.empty()
            productListNameAsc = filterdeProductList.sort((a, b) => b.productName.toLowerCase() < a.productName.toLowerCase() ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)

        }
        if (sortoption == 3) {
            productListNameAsc = filterdeProductList.sort((a, b) => new Date(a.registerDate) < new Date(b.registerDate) ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        if (sortoption == 4) {
            productListNameAsc = filterdeProductList.sort((a, b) => new Date(b.registerDate) < new Date(a.registerDate) ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        else {
            tbodyInf = generateTbodyInf(filterdeProductList)
        }
    }

    if (mainCategory.val() != 0 && subCategory.val() != 0) {//대분류 선택 소분류 선택
        if (sortoption == 1) {
            productListNameAsc = filterdeSubProductList.sort((a, b) => a.productName.toLowerCase() < b.productName.toLowerCase() ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)

        }
        if (sortoption == 2) {
            tbody.empty()
            productListNameAsc = filterdeSubProductList.sort((a, b) => b.productName.toLowerCase() < a.productName.toLowerCase() ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)

        }
        if (sortoption == 3) {
            productListNameAsc = filterdeSubProductList.sort((a, b) => new Date(a.registerDate) < new Date(b.registerDate) ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        if (sortoption == 4) {
            productListNameAsc = filterdeSubProductList.sort((a, b) => new Date(b.registerDate) < new Date(a.registerDate) ? -1 : 1)
            tbodyInf = generateTbodyInf(productListNameAsc)
        }
        else {
            tbodyInf = generateTbodyInf(filterdeSubProductList)
        }
    }

    tbody.append(tbodyInf)
}
)
//검색
searchBtn.click(function () {
    let searchOption = $('#search-options').val()
    tbody.empty()
    if (searchOption == 1) {
        $.get('/products/search/productName/' + searchInput.val())
            .done((res) => {
                productsList = res
                if (!productsList.length) {
                    Swal.fire({
                        title:'검색 결과 없음',
                        text: '검색결과가 없습니다',
                        icon:'warning',
                        timer:1000,
                        showConfirmButton:false
                    })
                }

                tbody.append(generateTbodyInf(productsList))
            })
            .fail(() =>  Swal.fire({
                title:'검색 결과 없음',
                text: '검색결과가 없습니다',
                icon:'warning',
                timer:1000,
                showConfirmButton:false
            }))
    } else {
        $.get('/products/search/username/' + searchInput.val())
            .done((res) => {
                productsList = res
                if (!productsList.length) {
                    Swal.fire({
                        title:'검색 결과 없음',
                        text: '검색결과가 없습니다',
                        icon:'warning',
                        timer:1000,
                        showConfirmButton:false
                    })
                }

                tbody.append(generateTbodyInf(productsList))
            })
            .fail(() =>  Swal.fire({
                title:'검색 결과 없음',
                text: '검색결과가 없습니다',
                icon:'warning',
                timer:1000,
                showConfirmButton:false
            }))
    }


})
//엑셀로 내보내기
$('#export-btn').click(() => {
    $.getJSON('/products/export/excel')
        .done((res) => {
            Swal.fire({
                title:'Export 성공',
                text: '성공적으로 Excel 파일이 내보내 졌습니다',
                icon:'success',
                timer:2000,
                showConfirmButton:false
            })
            console.log(typeof res)
        })
        .fail((res) => {
            console.log(res) 
            Swal.fire({
                title:'내보내기 실패',
                text: res.responseJSON.message,
                icon:'error',
            })
         })
})

$(document).on("click", "#delete-btn", function () {
    const productCode =  $(this).val()
    Swal.fire({
        title: `<strong  style="color: red;">${productCode}</strong> 삭제`,
        text: `삭제 후 복구가 어렵습니다. 물품번호를 다시 한번 확인 바랍니다!!` ,
        icon: 'warning',
        
        showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
        confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
        cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
        confirmButtonText: '삭제', // confirm 버튼 텍스트 지정
        cancelButtonText: '취소', // cancel 버튼 텍스트 지정
        
        reverseButtons: true, // 버튼 순서 거꾸로
        
     }).then(result => {
        // 만약 Promise리턴을 받으면,
        if (result.isConfirmed) { // 만약 모달창에서 confirm 버튼을 눌렀다면
            $.post('/products/delete', { productCode })
            .done(() => {
                Swal.fire({title:'삭제가 완료되었습니다.', text:'복구를 원할시 데이터 관리자에게 문의 바랍니다', icon:'success', showConfirmButton:false});
                setTimeout(() => {window.location.href = window.location.href}, 2000) 
                
            })
            .fail((res) => {
                console.log(res)           
                 Swal.fire({
                    title:'삭제 실패',
                    text: res.responseJSON.message,
                    icon:'error',
                }) 
            })
        }
     });

});

$(document).on("click", "#rental-btn", function () {
    const retalFormPopup = window.open('/products/rentalForm/' + $(this).val(), 'rentalform popup', 'width=700px,height=800px,scrollbars=yes')
    retalFormPopup.addEventListener('beforeunload', function (e) {
        if ($('#chkEdit').val() == 1) {
            window.location.reload()
            $('#chkEdit').val() = '0'
        }
    });
});



$(document).on("click", "#user-list", function () {
    window.open('/products/usersInf/' + $(this).val(), 'user-list form popup', 'width=700px,height=800px,scrollbars=yes')
});

$(document).on("click", "#rental-record", function () {
    window.open('/products/rentalRecord/' + $(this).val(), 'user-list form popup', 'width=700px,height=800px,scrollbars=yes')
});

$(document).on("click", "#edit-btn", function () {
    const edintFormPopup = window.open('/products/edit/' + $(this).val(), 'product edit form popup', 'width=700px,height=800px,scrollbars=yes')
    edintFormPopup.addEventListener('beforeunload', function (e) {
        if ($('#chkEdit').val() == 1) {
            window.location.reload()
            $('#chkEdit').val() = '0'
        }
    });
});

