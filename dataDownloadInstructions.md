To run the Python script to download the files locally, you will need to authenticate the Kaggle API. 

Start by making an account for Kaggle: `https://www.kaggle.com/`. Once created, click on your profile in the top right, then click on "Settings".
In the settings page, scroll down to the "API" section, and click "Create New Token".
This triggers the download of kaggle.json, which is a file containing your API credentials.

If you are using the Kaggle CLI tool, the tool will look for this token at **~/.kaggle/kaggle.json** on Linux, OSX, and other UNIX-based operating systems, and at **C:\Users\<Windows-username>\\.kaggle\kaggle.json** on Windows. If the token is not there, an error will be raised. Hence, once you’ve downloaded the token, you should move it from your Downloads folder to this folder.
- If you are using the Kaggle API directly, where you keep the token doesn’t matter, so long as you are able to provide your credentials at runtime.

**Before running the file, please ensure that `kaggle.json` is correctly stored as per your local OS.**

If you need to, also run the following terminal command to install the `kaggle` package for Python:
- `pip install kaggle`
