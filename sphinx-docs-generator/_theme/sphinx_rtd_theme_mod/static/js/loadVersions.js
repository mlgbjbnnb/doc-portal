
jQuery(function () {
    version_info.current_version = current_version;
    version_info.current_lang    = current_lang;

    version_info.title           = version_info          ["title_" + current_lang];
    version_info.versions.title  = version_info.versions ["title_" + current_lang];
    version_info.languages.title = version_info.languages["title_" + current_lang];

    var compiled = underscore.template($("#versions-template").html());
    $("#version-wrapper").html(compiled(version_info));

});