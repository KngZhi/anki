tell application "OmniFocus"
	tell default document
		set interestingProject to first flattened project whose name is "ELC Website"
		set interestingTasks to flattened tasks of interestingProject
		return interestingTasks
	end tell
end tell
