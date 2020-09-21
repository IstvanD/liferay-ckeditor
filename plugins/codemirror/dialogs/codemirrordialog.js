CKEDITOR.dialog.add('codemirrordialog', function (editor) {
	var editorWindow = CKEDITOR.document.getWindow();
	var size = editorWindow.getViewPaneSize();
	var scalex = 0.9;
	var scaley = 0.7;
	var height = size.height * scaley;
	var width = size.width * scalex;

	if (!editor.window) {
		editor.window = editorWindow;
	}

	return {
		_createCodeMirrorEditor: function () {
			var dialog = this.dialog;

			var size = dialog.getSize();

			var textarea = dialog
				.getContentElement('main', 'data')
				.getInputElement().$;

			var codeMirrorEditor = (this.codeMirrorEditor = CodeMirror.fromTextArea(
				textarea,
				{
					lineNumbers: true,
					lineWrapping: true,
					mode: 'text/html',
				}
			));

			var padding = 40;

			var defaultWidth = size.width / 2 - padding;

			codeMirrorEditor.setSize(defaultWidth, null);

			var editor = dialog.getParentEditor();

			codeMirrorEditor.setValue(html_beautify(editor.getData(true)));

			var preview = dialog
				.getContentElement('main', 'preview')
				.getElement();
			preview.setSize('width', defaultWidth);

			this._createContentIframe(preview);

			codeMirrorEditor.on(
				'change',
				this._handleCodeMirrorChange.bind(this)
			);
		},

		_createContentIframe: function (parentElement) {
			var dialog = this.dialog;
			var editor = dialog.getParentEditor();

			var mainElement = dialog.getContentElement('main').getElement();

			var tabPanel = mainElement.getAscendant(function (el) {
				return (
					el.getName() === 'div' &&
					el.getAttribute('role') === 'tabpanel'
				);
			});

			var tabPanelParent = tabPanel.getParent();

			var padding = {
				bottom:
					parseInt(
						tabPanelParent.getComputedStyle('padding-bottom'),
						10
					) || 0,
				top:
					parseInt(
						tabPanelParent.getComputedStyle('padding-top'),
						10
					) || 0,
			};

			var height =
				tabPanel.getSize('height') - (padding.bottom + padding.top);

			var iframe = new CKEDITOR.dom.element('iframe');

			function handleStyles() {
				var iframeDocument = iframe.$.contentDocument;

				var iframeHead = iframeDocument.head;

				var contentsCss = editor.config.contentsCss;

				if (Array.isArray(contentsCss)) {
					contentsCss.forEach(function (url) {
						var link = iframeDocument.createElement('link');
						link.setAttribute('href', url);
						link.setAttribute('rel', 'stylesheet');

						iframeHead.appendChild(link);
					});
				} else {
					var link = iframeDocument.createElement('link');
					link.setAttribute('href', contentsCss);
					link.setAttribute('rel', 'stylesheet');

					iframeHead.appendChild(link);
				}

				var direction = editor.config.contentsLangDirection;

				var iframeHtml = iframeDocument.documentElement;
				iframeHtml.setAttribute('dir', direction);
				iframeHtml.setAttribute('lang', editor.config.defaultLanguage);

				var iframeBody = iframeDocument.body;
				iframeBody.classList.add('cke_editable');
				iframeBody.classList.add('cke_editable_themed');
				iframeBody.classList.add('cke_contents_' + direction);

				iframeBody.setAttribute('contenteditable', false);
				iframeBody.setAttribute('spellcheck', false);

				iframeBody.style.background = '#fff';
			}

			var data = this.codeMirrorEditor.getValue();

			iframe.on('load', function () {
				var iframeBody = iframe.$.contentDocument.body;

				iframeBody.innerHTML = data;

				handleStyles();
			});

			parentElement.append(iframe);

			iframe.setAttributes({
				class: 'cke_wysiwyg_frame cke_reset',
				frameborder: 0,
			});

			iframe.setStyles({
				height: height + 'px',
				width: '99%',
			});

			return iframe;
		},

		_handleCodeMirrorChange: function () {
			var newData = this.codeMirrorEditor.getValue();
			var preview = this.dialog
				.getContentElement('main', 'preview')
				.getElement();

			var iframe = preview.findOne('iframe');
			if (iframe && iframe.$) {
				var iframeDocument = iframe.$.contentDocument;
				var iframeBody = iframeDocument.body;
				iframeBody.innerHTML = newData;
			}
		},

		contents: [
			{
				id: 'main',
				elements: [
					{
						align: 'top',
						children: [
							{
								id: 'data',
								type: 'textarea',
							},
							{
								html: '<div class="code_preview">&nbsp;</div>',
								id: 'preview',
								type: 'html',
							},
						],
						type: 'hbox',
					},
				],
			},
		],

		height: height,
		title: editor.lang.codemirror.source,
		width: width,

		onLoad: function () {
			this.definition._createCodeMirrorEditor();
		},

		onOk: function () {
			var definition = this.definition;
			var editor = this.getParentEditor();
			var newData = definition.codeMirrorEditor.getValue();
			var oldData = editor.getData();

			if (newData !== oldData) {
				editor.setData(newData);
				editor.setMode('wysiwyg');
			}
		},

		onShow: function () {
			var codeMirrorEditor = this.definition.codeMirrorEditor;
			var editor = this.getParentEditor();
			var data = editor.getData();

			if (codeMirrorEditor && codeMirrorEditor.getValue() !== data) {
				codeMirrorEditor.setValue(html_beautify(data));
			}
		},
	};
});
