/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/* global alert */

CKEDITOR.dialog.add( 'embedBase', function( editor ) {
	'use strict';

	var lang = editor.lang.embedbase;

	return {
		title: lang.title,
		minWidth: 350,
		minHeight: 50,

		onLoad: function() {
			var that = this,
				okButton = that.getButton( 'ok' ),
				loadContentRequest = null;

			this.on( 'ok', function( evt ) {
				// We're going to hide it manually, after remote response is fetched.
				evt.data.hide = false;

				// Disable the OK button for the time of loading, so user can't trigger multiple inserts.
				okButton.disable();

				// We don't want the widget system to finalize widget insertion (it happens with priority 20).
				evt.stop();

				var url = that.getValueOf( 'info', 'url' );

				loadContentRequest = that.widget.loadContent( url, {
					noNotifications: true,

					callback: function() {
						if ( !that.widget.isReady() ) {
							editor.widgets.finalizeCreation( that.widget.wrapper.getParent( true ) );
						}

						editor.fire( 'saveSnapshot' );

						that.hide();
						unlock();
					},

					errorCallback: function( messageTypeOrMessage ) {
						that.getContentElement( 'info', 'url' ).select();

						alert( that.widget.getErrorMessage( messageTypeOrMessage, url, 'Given' ) );

						unlock();
					}
				} );
			}, null, null, 15 );

			this.on( 'cancel', function( evt ) {
				if ( evt.data.hide && loadContentRequest ) {
					loadContentRequest.cancel();
					unlock();
				}
			} );

			function unlock() {
				okButton.enable();
				loadContentRequest = null;
			}
		},

		contents: [
			{
				id: 'info',

				elements: [
					{
						type: 'text',
						id: 'url',
						label: lang.url,

						setup: function( widget ) {
							this.setValue( widget.data.url );
						},

						validate: function() {
							if ( !this.getDialog().widget.isUrlValid( this.getValue() ) ) {
								return lang.unsupportedUrlGiven;
							}

							return true;
						}
					}
				]
			}
		]
	};
} );