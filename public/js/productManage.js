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
                                ${
                                    productsList[i].rentalAvailability ? "<button id=rental-btn type=button value="+productsList[i].productCode+">대여</button>" : ""
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
    $.get('/products/getAll')
        .done((res) => {
            productsList = res
            tbody.empty()
            let  tbodyInf = generateTbodyInf(productsList)
            tbody.append(tbodyInf)
        })
        .fail((res) => { alert(res.responseJSON) })

    $.get('/category').done((res) => {
        category = res
        for (let i = 0; i < category.length; i++) {
            subOptions[category[i].mainCategory] = category[i].subCategory
            let option = "<option value=" + category[i].mainCategory + ">" + category[i].mainCategory + "</option>"
            mainCategory.append(option)
        }
    }).fail(() => {
        alert("서버에 오류가 생겼습니다 잠시후 다시 시도해주시길 바랍니다")
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
                    alert('검색결과가 없습니다')
                }

                tbody.append(generateTbodyInf(productsList))
            })
            .fail(() => alert('검색결과 없습니다'))
    }else{
        $.get('/products/search/username/' + searchInput.val())
        .done((res) => {
            productsList = res
            if (!productsList.length) {
                alert('검색결과가 없습니다')
            }

            tbody.append(generateTbodyInf(productsList))
        })
        .fail(() => alert('검색결과 없습니다'))
    }


})
//엑셀로 내보내기
$('#export-btn').click(() => {
    $.get('/products/export/excel')
    .done((res) => alert(res.message))
    .fail(() => {alert('다운로드중 에러가 발생 했습니다 에러가 지속될 경우 관리자에게 문의 바랍니다')})
})

$(document).on("click", "#delete-btn", function(){
    $.post('/products/delete',{productCode: $(this).val()})
        .done(() => { window.location.href=window.location.href })
        .fail((res) => { alert(res.responseJSON) })
});

$(document).on("click", "#rental-btn", function(){   
    window.open('/products/rentalForm/'+$(this).val(),'rentalform popup', 'width=700px,height=800px,scrollbars=yes')
});

$(document).on("click", "#user-list", function(){   
    window.open('/products/usersInf/'+$(this).val(),'user-list form popup', 'width=700px,height=800px,scrollbars=yes')
});

$(document).on("click", "#rental-record", function(){   
    window.open('/products/rentalRecord/'+$(this).val(),'user-list form popup', 'width=700px,height=800px,scrollbars=yes')
});

$(document).on("click", "#edit-btn", function(){   
    window.open('/products/edit/'+$(this).val(),'product edit form popup', 'width=700px,height=800px,scrollbars=yes')
});

