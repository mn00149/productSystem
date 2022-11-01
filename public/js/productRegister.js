let category = []
let subOptions = {}
let mainCategory = $('#select-main')
let mainCategoryInput = $('.main-category-input')
let subCategory = $('#select-sub')
let subCategoryInput = $('.sub-category-input')
let productCodeInput = $('#product-code')
let productNameInput = $('#product-name')

$(document).ready(function () {
    $.get('/category').done((res) => {
        category = res
        for (let i = 0; i < category.length; i++) {

            subOptions[category[i].mainCategory] = category[i].subCategory
            let option = "<option value=" + category[i].mainCategory + ">" + category[i].mainCategory + "</option>"
            mainCategory.append(option)
        }
    })

    $('#quantity').val('1')

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

$('#register-btn').click(function () {
    let mainCategory = mainCategoryInput.val()
    let subCategory = subCategoryInput.val()
    let productName = productNameInput.val()
    let rentalAvailability = $("input:checkbox[name='rent-avl']:checked").val()
    let returnAvailability = $("input:checkbox[name='return-avl']:checked").val()
    let productCode = productCodeInput.val()
    let quantity = Number($('#quantity').val())

    let data = { mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity }

    $.post('/products/register', data).done((res) => {
        alert(res.message)

    })
        .fail((res) => {
            alert(res.responseJSON)
            console.log(res)
        })
})

$('.reset-btn').click(function(){
    reset([mainCategoryInput, subCategoryInput, productCodeInput, productNameInput ])
})

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
