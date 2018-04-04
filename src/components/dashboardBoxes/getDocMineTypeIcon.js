import React from 'react';
import Icon from 'antd/lib/icon';

const getDocMineTypeIcon = (document) => {
	switch (document.mimeType) {

		// pdf
		case 'application/pdf':
			return <Icon className="file-icon red" type="file-pdf"/>;

		// powerpoint
		case 'application/vnd.ms-powerpoint':                                              // .ppt .pot .pps .ppa
		case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':  // .pptx
		case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':                 // .pptm
		case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':     // .ppsx
		case 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12':                    // .ppsm
		case 'application/vnd.openxmlformats-officedocument.presentationml.template':      // .potx
		case 'application/vnd.ms-powerpoint.template.macroEnabled.12':                     // .potm
		case 'application/vnd.ms-powerpoint.addin.macroEnabled.12':                        // .ppam
		case 'application/vnd.openxmlformats-officedocument.presentationml.slide':         // .sldx
		case 'application/vnd.ms-powerpoint.slide.macroEnabled.12':                        // .sldm
			return <Icon className="file-icon orange" type="file-ppt"/>;

		// word
		case 'application/msword':                                                         // .doc .dot
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':    // .docx
		case 'application/vnd.ms-word.document.macroEnabled.12':                           // .docm
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':    // .dotx
		case 'application/vnd.ms-word.template.macroEnabled.12':                           // .dotm
			return <Icon className="file-icon blue" type="file-word" />;

		// excel
		case 'application/vnd.ms-excel':                                                   // .xls .xlt .xla
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':          // .xlsx
		case 'application/vnd.ms-excel.sheet.macroEnabled.12':                             // .xlsm
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':       // .xltx
		case 'application/vnd.ms-excel.template.macroEnabled.12':                          // .xltm
		case 'application/vnd.ms-excel.sheet.binary.macroEnabled.12':                      // .xlsb
		case 'application/vnd.ms-excel.addin.macroEnabled.12':                             // .xlam
			return <Icon className="file-icon green" type="file-excel" />;

		// image
		case 'image/jpeg':                                                                 // .jpg
		case 'image/png' :                                                                 // .png
		case 'image/gif' :                                                                 // .gif
			return <Icon className="file-icon purple" type="file-jpg"/>;

		// other files
		default:                                                                           // .*
			return <Icon className="file-icon" type="file-text" />;
	}
};

export default getDocMineTypeIcon;