let category = []
let productsList = []
let tbody = $('#product-tbody')
let mainCategory = $('#select-main')
let subCategory = $('#select-sub')
let subOptions = {}
function availability(i){
    if(i==1)return "O"
    else return "X"
}

function generateTbodyInf(productList){
    let product = ""        
        for (let i = 0; i < productsList.length; i++) {
            let total = productsList[i].quantity + productsList[i].lended.length
            let lending = productsList[i].lended.length
            let left = total -lending
            product += `                        
        <tr>
            <td>${productsList[i].category.mainCategory}</td>
            <td>${productsList[i].category.subCategory}</td>
            <td>
                <p>물품명:${productsList[i].productName}</p>
                <p>코드:${productsList[i].productCode}</p>
            </td>
            <td>
                <p>총량:${total}</p>
                <p>대여중:${lending}</p>
                <p>대여가능:${left}</p>
            </td>
            <td>
                <p>대여가능 여부:${availability(productsList[i].rentalAvailability)}</p>
                <p>반납필요 여부:${availability(productsList[i].returnAvailability)}</p>
            </td>
            <td>등록일</td>
            <td>
                <div class="select-btn">
                    <button type="button">대여자 목록</button>
                    <button type="button">삭제</button>
                    <button type="button">수정</button>
                <div>
            </td>
        </tr>`;
            
        }
    return product
}

$(document).ready(function () {
    $.get('/products/getAll')
    .done((res) => {
        productsList = res
        tbody.empty()
        let tbodyInf = generateTbodyInf(productsList)        
        tbody.append(tbodyInf)
    })
    .fail((res) => {alert(res.responseJSON)})

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

mainCategory.change(function () {
    let currentMain = $(this).val()
    subCategory.empty();
    subCategory.append("<option>소분류</option>")
    let subOptionList = subOptions[currentMain]
    if (subOptionList) {
        for (let i = 0; i < subOptionList.length; i++) {
            let option = "<option value=" + subOptionList[i] + ">" + subOptionList[i] + "</option>"
            subCategory.append(option)
        }
    
    }

    if (currentMain == '0') {
        mainCategoryInput.val('')

    } else { mainCategoryInput.val(currentMain) }
    subCategoryInput.val('')
})

$('#sorting').change(function(){
    tbody.empty()
    console.log($(this).val())
    if($(this).val() == 1){
        let productListNameAsc = productsList.sort((a, b) => a.productName.toLowerCase() < b.productName.toLowerCase() ? -1 : 1)
        let tbodyInf = generateTbodyInf(productListNameAsc)
        tbody.append(tbodyInf)
    }
    if($(this).val() == 2){
        let productListNameAsc = productsList.sort((a, b) => b.productName.toLowerCase() < a.productName.toLowerCase() ? -1 : 1)
        let tbodyInf = generateTbodyInf(productListNameAsc)
        tbody.append(tbodyInf)
    }
})
