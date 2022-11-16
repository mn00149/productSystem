let category = []
let subOptions = {}
let mainCategory = $('#select-main')
let mainCategoryInput = $('.main-category-input')
let subCategory = $('#select-sub')
let subCategoryInput = $('.sub-category-input')
let productCodeInput = $('#product-code')
let productNameInput = $('#product-name')
let hidecode = $('#hidecode')
let hidemain = $('#hidemain')
let hidesub = $('#hidesub')
let hidename = $('#hidename')
let hidequan = $('#hidequan')
let hidereturn = $('#hidereturn')
let hiderental = $("#hiderental")
let oproductCode = hidecode.text().trim()
$(document).ready(function () {

    let omainCategory = hidemain.text().trim()
    let osubCategory = hidesub.text().trim()
    let oproductname = hidename.text().trim()
    let oquantity = hidequan.text().trim()
    let oreturnAvl = hidereturn.text().trim()
    let orentalAvl = hiderental.text().trim()

    $.get('/category').done((res) => {
        category = res
        for (let i = 0; i < category.length; i++) {

            subOptions[category[i].mainCategory] = category[i].subCategory
            let option = "<option value=" + category[i].mainCategory + ">" + category[i].mainCategory + "</option>"
            mainCategory.append(option)
        }
    })
    mainCategoryInput.val(omainCategory)
    subCategoryInput.val(osubCategory)
    productCodeInput.val(oproductCode)
    productNameInput.val(oproductname)
    $('#quantity').val(oquantity)
    if ($('#rent-true').val() == orentalAvl) {
        $('#rent-true').prop('checked', true)
    } else { $('#rent-false').prop('checked', true) }
    if ($('#return-true').val() == oreturnAvl) {
        $('#return-true').prop('checked', true)
    } else { $('#return-false').prop('checked', true) }
})

mainCategory.change(function () {
    let currentMain = $(this).val()
    subCategory.empty();
    subCategory.append("<option>직접입력</option>")
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

subCategory.change(function () {
    let currentSub = $(this).val()
    if (currentSub == '직접입력') {
        subCategoryInput.val('')
    } else { subCategoryInput.val(currentSub) }
})

$('input[type="checkbox"][name="rent-avl"]').click(function () {

    if ($(this).prop('checked')) {

        $('input[type="checkbox"][name="rent-avl"]').prop('checked', false);

        $(this).prop('checked', true);

    }

});

$('input[type="checkbox"][name="return-avl"]').click(function () {

    if ($(this).prop('checked')) {

        $('input[type="checkbox"][name="return-avl"]').prop('checked', false);

        $(this).prop('checked', true);

    }

});

//물품수정버튼
$('#register-btn').click(function () {
    let mainCategory = mainCategoryInput.val()
    let subCategory = subCategoryInput.val()
    let productName = productNameInput.val()
    let rentalAvailability = $("input:checkbox[name='rent-avl']:checked").val()
    let returnAvailability = $("input:checkbox[name='return-avl']:checked").val()
    let productCode = productCodeInput.val()
    let quantity = Number($('#quantity').val())

    let data = { oproductCode, mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity }

    $.post('/products/edit', data)
        .done((res) => {
            Swal.fire({
                title:'수정 성공',
                text: res.message,
                icon: 'success',
                showConfirmButton: false
            })
            opener.document.getElementById('chkEdit').value = '1'
            setTimeout(() => {window.close();}, 1500)
            
        })
        .fail((res) => {
            Swal.fire({
                title:'수정 실패',
                text: res.responseJSON.message,
                icon: 'error',
            })
            console.log(res)
        })
})
//리셋버튼 클릭
$('.reset-btn').click(function () {
    reset([mainCategoryInput, subCategoryInput, productCodeInput, productNameInput])
})
// 리셋 함수
function reset(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i].val('');
    };
    $('input[type="checkbox"][name="rent-avl"]').prop('checked', false);
    $('input[type="checkbox"][name="return-avl"]').prop('checked', false);
    $('#rent-true').prop('checked', true)
    $('#quantity').val('1')
    $('#return-true').prop('checked', true)
}
