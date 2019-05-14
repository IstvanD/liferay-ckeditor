#!/bin/sh

set -e

function init() {
	# Make sure submodule is registered and up-to-date.
	git submodule update --init

	# Fetch remote changes.
	cd ckeditor-dev

	# Make sure our working copy is clean.
	git reset --hard HEAD --quiet
	git clean -fdx
}

function usage() {
	echo "Usage: ck.sh COMMAND"
	echo
	echo "  Where COMMAND is either:"
	echo
	echo "  🔧  setup: Setup everything to start working on a patch"
	echo "  💉  patch: Generate patches "
	echo "  🔥  build: Generate a patched version of CKEditor"
	echo
	echo
}

# Check arguments
if [ $# -ne 1 ]; then
	usage
	exit 1
fi

COMMAND=$1

case "$COMMAND" in
	build)
		echo
		echo "*---------------------------------------------------------*"
		echo "|                     ⚠️  WARNING                          |"
		echo "*---------------------------------------------------------*"
		echo

		echo "This will generate a patched version of CKEditor"
		read -p "Are you sure you want to continue? [y/n]" yn

		case $yn in
			[Yy]*)
				init
				git checkout --detach HEAD --quiet
				git branch -f liferay HEAD
				git checkout liferay

				echo
				echo "Checking for existing patches"
				echo

				if ! ls ../patches/*; then
					echo "There doesn't seem to be any patch"
				fi

				echo
				echo "Applying patches from \"patches/\" directory."
				echo

				if ! git am ../patches/*; then
					echo
					echo "⚠️ There was a problem applying patches:"
					echo
					echo "To retry manually and fix:"
					echo
					echo "  cd ckeditor-dev"
					echo "  git am --abort"
					echo "  git am ../patches/*"
					echo
					echo "Once you are happy with the result, run `sh ck.sh patch` to update the contents of \"patches/\"."
					echo
					exit 1
				fi

				if [ -n "$DEBUG" ]; then
					dev/builder/build.sh --build-config ../../../build-config.js \
						--leave-css-unminified --leave-js-unminified
				else
					dev/builder/build.sh --build-config ../../../build-config.js
				fi

				# Remove old build files.
				rm -rf ../ckeditor/*

				# Replace with new build files.
				cp -r dev/builder/release/ckeditor/* ../ckeditor/

				echo
				echo "*---------------------------------------------------------*"
				echo "|                        ✅ DONE                          |"
				echo "*---------------------------------------------------------*"
				echo
				echo "Don't forget to commit the result!"
				echo
				;;
			*)
				echo
				echo "Aborting."
				echo
		esac
		;;
	patch)
		init
		# Navigate back to superproject
		cd ..

		# Save SHA1 for later
		sha1=`git submodule | grep ckeditor-dev | awk '{print $1}' | sed -e s/[^0-9a-f]//`

		cd ckeditor-dev

		# Check for the existence of the liferay branch in the submodule
		if ! git rev-parse --verify liferay &>/dev/null; then
			echo
			echo "*---------------------------------------------------------*"
			echo "|                        ❌ ERROR                         |"
			echo "*---------------------------------------------------------*"
			echo
			echo  "It seems that there's no `liferay` branch in the `ckeditor-dev` submodule."
			echo
			echo  "Please run `sh ck.sh setup` to set up everything correctly."
			echo

			exit 1
		fi

		git checkout liferay --quiet

		# Check for existing patches
		patches=$(find ../patches -name *.patch -type f)

		if [[ $(echo "$patches" | wc -l) -ne 0 ]]; then
			echo
			echo "*---------------------------------------------------------*"
			echo "|                       ⚠️  WARNING                        |"
			echo "*---------------------------------------------------------*"
			echo
			echo
			echo  "This will replace any existing patches..."
			echo
			echo "$patches"
			echo

			# Prompt the user to confirm he wants to delete existing patches
			read -p "Are you sure you want to continue [y/n]? " yn
			case $yn in
				[Yy]*)
					echo
					echo "Removing existing patches."
					echo

					mkdir -p ../patches
					rm -rf ../patches/*
					;;
				*)
					echo
					echo "Aborting."
					echo
					exit 1
					;;
			esac
		else
			echo
			echo "No patches found."
			echo
		fi

		echo "Generating patches."
		echo

		git format-patch $sha1 -o ../patches

		echo
		echo "*---------------------------------------------------------*"
		echo "|                       ✅  DONE                          |"
		echo "*---------------------------------------------------------*"
		echo
		echo
		echo "You can now build CKEditor with your patches."
		echo
		echo
		echo "Here are the steps to follow:"
		echo
		echo "1. Run `sh ./ck.sh build` to generate a patched version."
		echo
		;;
	setup)
		init
		git checkout --detach HEAD
		git branch -f liferay HEAD
		git checkout liferay

		echo
		echo "*---------------------------------------------------------*"
		echo "|                       ✅  DONE                          |"
		echo "*---------------------------------------------------------*"
		echo
		echo
		echo "You can now start working on your patch(es)."
		echo
		echo
		echo "Here are the steps to follow:"
		echo
		echo "1. Navigate to the ckeditor-dev submodule directory (`cd ckeditor-dev`)"
		echo "2. Work on your changes"
		echo "3. Commit your changes"
		echo "4. Run `sh ck.sh patch` to generate the patches"
		echo
		;;
	*)
		usage
		;;
esac
