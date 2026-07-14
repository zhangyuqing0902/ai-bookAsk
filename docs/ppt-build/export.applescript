set inPath to "/Users/ziye/Documents/codes/ai-bookAsk/docs/AI问书-项目提报.pptx"
set outPath to "/Users/ziye/Documents/codes/ai-bookAsk/docs/ppt-build/render"
tell application "Keynote" to activate
delay 1
tell application "Keynote" to open (POSIX file inPath)
set ok to false
repeat 40 times
	delay 1
	tell application "Keynote"
		if (count of documents) > 0 then
			set ok to true
			exit repeat
		end if
	end tell
end repeat
if ok then
	with timeout of 600 seconds
		tell application "Keynote"
			set theDoc to front document
			export theDoc to (POSIX file outPath) as slide images with properties {image format:PNG, skipped slides:false}
			close theDoc saving no
		end tell
	end timeout
end if
return ok
