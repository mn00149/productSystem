let category = []
let subOptions = {}
let mainCategory = $('#select-main')
let mainCategoryInput = $('.main-category-input')
let subCategory = $('#select-sub')
let subCategoryInput = $('.sub-category-input')
let productCodeInput = $('#product-code')
let productNameInput = $('#product-name')
let dataFromExcel = {}

$(document).ready(function () {
    //해당 Nav버튼 클릭 처리
    $('#move-productRegister').css('border-bottom', '3px solid black')
    $('#move-productRegister').css('font-weight', 'bold')
    $('#move-productRegister').css('font-size', '15px')
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
// 대분류 변동
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
//소분류 변동
subCategory.change(function () {
    let currentSub = $(this).val()
    if (currentSub == '직접입력') {
        subCategoryInput.val('')
    } else { subCategoryInput.val(currentSub) }
})
// 대여 여부 가능/불가 두개중 한개만 선택 가능 하도록 설정
$('input[type="checkbox"][name="rent-avl"]').click(function () {

    if ($(this).prop('checked')) {

        $('input[type="checkbox"][name="rent-avl"]').prop('checked', false);

        $(this).prop('checked', true);

    }

});
// 반납 여부 가능/불가 두개중 한개만 선택 가능 하도록 설정
$('input[type="checkbox"][name="return-avl"]').click(function () {

    if ($(this).prop('checked')) {

        $('input[type="checkbox"][name="return-avl"]').prop('checked', false);

        $(this).prop('checked', true);

    }

});

//물품등록버튼
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
        Swal.fire({
            title:'Register Success',
            text: res.message,
            icon:'success',
            timer:2000,
            showConfirmButton:false
        }
        )
        reset([mainCategoryInput, subCategoryInput, productCodeInput, productNameInput ])

    })
        .fail((res) => {
            Swal.fire({
                icon: 'error',
                title: '등록 실패',
                text: res.responseJSON.message,
              })
            console.log(res)
        })
})
//리셋버튼
$('.reset-btn').click(function(){
    reset([mainCategoryInput, subCategoryInput, productCodeInput, productNameInput ])
})

//취소버튼
$('.cancel-btn').click(function(){
    location.href = '/products/manage'
})
//엑셀폼 단운
$('#excel-down-btn').click(function(){
    $.get('/excelForm')
    .done((res) => {
        Swal.fire(
            'Excel 양식다운',
            "엑셀 양식이 다운로드 되었습니다",
            'success'
        )
    })
    .fail((res) => Swal.fire({
        icon:'error',
        title:'Excel 양식다운 실패',
        text:res.responseJSON.message
    }))
})

function reset(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i].val('');
    };
    $("#select-main").val("0").prop("selected", true);
    subCategory.empty();
    subCategory.append("<option>직접입력</option>")
    $('input[type="checkbox"][name="rent-avl"]').prop('checked', false);
    $('input[type="checkbox"][name="return-avl"]').prop('checked', false);
    $('#rent-true').prop('checked', true)
    $('#quantity').val('1')
    $('#return-true').prop('checked', true)
}

$('#import-excel').change(function() {
    let fileName = $("#import-excel").val();
    $(".upload-name").val(fileName);
    let input = this
    let reader = new FileReader();
    reader.onload = function () {
        let data = reader.result;
        let workBook = XLSX.read(data, { type: 'binary' });
        workBook.SheetNames.forEach(function (sheetName) {
            console.log('SheetName: ' + sheetName);
            let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
            console.log(JSON.stringify(rows));
            dataFromExcel = rows
        })
    };
    let test = reader.readAsBinaryString(input.files[0]);
    console.log(test)
})

$('#test').click(function(){
    if(Object.keys(dataFromExcel).length  == 0){
        Swal.fire({
        text:'엑셀 파일을 선택해주세요',
        icon:'warning',
        title:'파일이 없습니다'
    })}
    else{
        console.log(dataFromExcel)
        let data = [] 
        dataFromExcel.forEach((i) => {
            data.push(i)
        })
        $.post('/products/register/excel', {data})
        .done((res) => {
            Swal.fire({
                title:"등록 성공",
                text:res.message,
                icon:'success',
                timer: 2000,
                showConfirmButton:false
            }
            )
            setTimeout(() => {location.reload()}, 2500)
            
            
        })
        .fail((res) => Swal.fire({
            title: '등록 실패',
            text:res.responseJSON.message,
            icon: "error"
        }))
    }
    
})


