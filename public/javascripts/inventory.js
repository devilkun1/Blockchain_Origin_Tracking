$(document).ready(function () {
    console.log('isFarmer:', isFarmer())
    // $('#loading').hide();
    loadLabel();
    $.ajax({
        url: `/account/getAssetsByAccount/${getUsername()}`,
        type: 'GET',
        dataType: 'json',
        success: function (resp) {
            if (resp && resp.assets && resp.assets.length > 0) {
                $('tbody').empty();
                resp.assets.forEach(function (asset) {
                    let row = isFarmer() ? `
                        <tr id=${asset.ID}>
                        <td>${asset.ID}</td>
                        <td>${asset.ProductLot}</td>
                        <td>${asset.ProductName}</td>
                        <td>${asset.AppraisedValue}</td>
                        <td><button onClick="clickEdit(event)" class="buy-button" data-asset='${JSON.stringify(asset)}'>Edit</button></td>
                        </tr>
                    ` : `
                        <tr id=${asset.ID}>
                        <td>${asset.ID}</td>
                        <td>${asset.ProductLot}</td>
                        <td>${asset.ProductName}</td>
                        <td>${asset.AppraisedValue}</td>
                        </tr>
                    `
                    $('tbody').append(row);
                });
            }
        },
        error: function (error) {
            console.log('Get assests failed:', error);
        }
    });

    function reset() {
        $('#productName').val('');
        $('#productPrice').val('');
        $('#addEditBtn').val('Create');
    }

    $('#addEditBtn').on('click', function (e) {
        e.preventDefault();
        let flag = validate();

        if (flag && $('#addEditBtn').val() === 'Create') {
            $.ajax({
                url: `/transfer/create`,
                type: 'POST',
                dataType: 'json',
                data: {
                    ProductName: $('#productName').val(),
                    Owner: getUsername(),
                    AppraisedValue: $('#productPrice').val()
                },
                beforeSend: function () {
                    $('#loading').show();
                },
                success: function (resp) {
                    if (!resp.success) {
                        let row = `
                            <tr>
                            <td>${resp.ID}</td>
                            <td>${resp.ProductLot}</td>
                            <td>${resp.ProductName}</td>
                            <td>${resp.AppraisedValue}</td>
                            <td><button onClick="clickEdit(event)" class="buy-button" data-asset='${JSON.stringify(resp)}'>Edit</button></td>
                        `
                        $('tbody').append(row);
                        alert('Create asset successfully')
                    } else {
                        alert('Error happened when creating asset')
                    }
                },
                error: function (error) {
                    alert('Error! An error occurred. Please try again later.');
                    console.log('Create asset failed:', error);
                },
                complete: function () {
                    $('#loading').hide();
                    reset();
                }
            });
        } else if (flag && $('#addEditBtn').val() === 'Update') {
            if ($('#productName').val() === window.asset.ProductName && $('#productPrice').val() === window.asset.AppraisedValue) {
                return reset();
            }

            $.ajax({
                url: `/transfer/update`,
                type: 'PUT',
                dataType: 'json',
                data: {
                    ID: window.asset.ID,
                    ProductName: $('#productName').val(),
                    AppraisedValue: $('#productPrice').val()
                },
                beforeSend: function () {
                    $('#loading').show();
                },
                success: function (resp) {
                    if (!resp.success) {
                        let row = `
                            <td>${resp.ID}</td>
                            <td>${resp.ProductLot}</td>
                            <td>${resp.ProductName}</td>
                            <td>${resp.AppraisedValue}</td>
                            <td><button onClick="clickEdit(event)" class="buy-button" data-asset='${JSON.stringify(resp)}'>Edit</button></td>
                        `
                        $(`#${window.asset.ID}`).html(row);
                        alert('Update asset successfully');
                        window.location.reload();
                    } else {
                        alert('Error happened when updating asset')
                    }
                },
                error: function (error) {
                    alert('Update asset failed');
                    console.log('Update asset failed:', error);
                },
                complete: function () {
                    $('#loading').hide();
                    reset();
                }
            });
        }
    })
})

function validate() {
    let name = $('#productName').val();
    let price = $('#productPrice').val();

    if (!name || name.trim().length === 0) {
        alert('Please enter product name');
        return false;
    } else if (!price || price.trim().length === 0) {
        alert('Please enter product price');
        return false;
    } else {
        return true;
    }
}

function clickEdit(event) {
    loadLabel();
    window.asset = JSON.parse(event.currentTarget.getAttribute('data-asset'));
    $('#productName').val(window.asset.ProductName);
    $('#productPrice').val(window.asset.AppraisedValue);
}

function getUsername() {
    return JSON.parse($("#inv-username").text()).gmail;
}

function isFarmer() {
    return $('#action-farmer').length === 1;
}

function loadLabel() {
    let status = $('#addEditBtn').val();
    if (!status || status == 'add') {
        $('#addEditBtn').val('Create');
    } else {
        $('#addEditBtn').val('Update');
    }
}