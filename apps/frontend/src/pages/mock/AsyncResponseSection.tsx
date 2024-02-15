import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useMock } from "../../utils/hooks";

import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript.js";

export const AsyncResponseSection = () => {
	const { asyncResponse } = useMock();
	return (
		<Fade in={true} timeout={2500}>
			<Paper
				sx={{
					width: "100%",
					p: 1,
					px: 2,
				}}
			>
				<Typography variant="h6">Async:</Typography>
				{asyncResponse ? (
					<CodeMirror
						value={JSON.stringify(asyncResponse, null, 2)}
						autoCursor={false}
						options={{
							readOnly: "nocursor",
							theme: "material",
							height: "auto",
							viewportMargin: Infinity,
							mode: {
								name: "javascript",
								json: true,
								statementIndent: 2,
							},
							lineNumbers: true,
							// lineWrapping: true,
							indentWithTabs: false,
							tabSize: 2,
						}}
					/>
				) : (
					<Typography color="text.secondary" variant="subtitle2">
						Awaiting Request
					</Typography>
				)}
			</Paper>
		</Fade>
	);
};
