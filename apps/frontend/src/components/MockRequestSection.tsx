import { InfoOutlined } from "@mui/icons-material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Textarea from "@mui/joy/Textarea";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade/Fade";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { CurlDisplay } from ".";
import { useAction, useDomain, useMock } from "../utils/hooks";
import { URL_MAPPING } from "../utils";
import axios, { AxiosError } from "axios";
import { UserGuide } from "./UserGuideSection";

// type MockRequestSectionProp = {
// 	domain: string;
// };

export const MockRequestSection = () => {
	const [log, setLog] = useState<string>();
	const [showCurl, setShowCurl] = useState(false);
	const [activeScenario, setActiveScenario] = useState<{
		name: string;
		scenario: string;
	}>();

	const { domain } = useDomain();
	const [version, setVersion] = useState("");
	const { action, detectAction, logError, scenarios,setLogError } = useAction();
	const { setAsyncResponse, setSyncResponse } = useMock();

	useEffect(()=>{
    setLog("")
    setLogError(false)
  },[domain])
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		setSyncResponse(undefined);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		setAsyncResponse(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [version]);

	const [curl, setCurl] = useState<string>();

	const handleVersion = (
		event: React.MouseEvent<Element> | React.KeyboardEvent<Element> | React.FocusEvent<Element> | null,
		value: {} | null
	) => {
		console.log("event",event)
		if (value) {
			setVersion(value as string); // Ensure value is a string and set the version
		}
	};

	const handleLogChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setLog(e.target.value);
		detectAction(e.target.value,version);
	};

	const handleSubmit = async () => {
		let url = `${[
			import.meta.env.VITE_SERVER_URL,
		]}/${domain.toLowerCase()}/${Object.keys(URL_MAPPING).filter((key) =>
			URL_MAPPING[key as keyof typeof URL_MAPPING].includes(action as string)
		)}/${action}?mode=mock&version=${version}`;
		if (activeScenario?.scenario)
			url = url + `&scenario=${activeScenario?.scenario}`;

		setCurl(`curl -X POST \\
		  ${url} \\
		-H 'accept: application/json' \\
		-H 'Content-Type: application/json' \\
		-H 'mode: mock' \\
		-d '${log}'`);
		try {
			const response = await axios.post(url, JSON.parse(log as string), {
				headers: {
					"Content-Type": "application/json",
					"mode": "mock"
				},
			});
			
			setSyncResponse(response.data.sync);
			setAsyncResponse(response.data.async || {});
		} catch (error) {
			console.log("ERROR Occured while pinging backend:", error);
			setAsyncResponse({});
			if (error instanceof AxiosError) setSyncResponse(error.response!.data);
		}
		setShowCurl(true);
	};
	return (
		<>
			<Fade in={true} timeout={1500}>
				<Paper
					sx={{
						p: 2,
					}}
					elevation={5}
				>
					<Stack spacing={2} justifyContent="center" alignItems="center">
						<Typography variant="h5">Mock Server</Typography>
						{domain === "retail" && (
							<Select placeholder="Select a version" sx={{ width: "100%" }} onChange={handleVersion}>
								<Option value="b2b">B2B</Option>
								<Option value="b2c">B2C</Option>
							</Select>
						)}
						<FormControl error={logError} sx={{ width: "100%" }}>
							<Textarea
								minRows={10}
								maxRows={15}
								sx={{ width: "100%" }}
								placeholder="Request Body"
								value={log}
								onChange={handleLogChange}
							/>
							{logError && (
								<Stack justifyContent="center">
									<FormHelperText>
										<InfoOutlined />
										Opps! The log seems to be invalid.
									</FormHelperText>
								</Stack>
							)}
						</FormControl>
						{action && (
							<Grid container>
								<Grid item xs={12} md={6}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "flex-start",
											alignItems: "center",
										}}
									>
										<Typography mr={1}>Detected Action:</Typography>
										<Typography color="text.secondary" variant="body2">
											{action}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} md={6}>
									<Select
										placeholder="Select a scenario"
										indicator={<KeyboardArrowDown />}
										sx={{
											width: "100%",
											[`& .${selectClasses.indicator}`]: {
												transition: "0.2s",
												[`&.${selectClasses.expanded}`]: {
													transform: "rotate(-180deg)",
												},
											},
										}}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore
										onChange={(
											_event: React.SyntheticEvent | null,
											newValue: object
										) => {
											setActiveScenario(
												newValue as { name: string; scenario: string }
											);
										}}
										defaultValue={scenarios![0]}
										disabled={scenarios?.length === 0}
									>
										{scenarios?.map((scenario, index) => (
											<Option
												value={scenario}
												key={"scenario-" + index}
												disabled={!scenario.scenario}
											>
												{scenario.name +
													(scenario.scenario ? `` : "(Work In-Progress)")}
											</Option>
										))}
									</Select>
								</Grid>
							</Grid>
						)}
						<Button
							variant="solid"
							onClick={handleSubmit}
							disabled={
								logError ||
								!action ||
								(scenarios!.length > 0 && !activeScenario)
							}
						>
							Submit
						</Button>
					</Stack>
				</Paper>
			</Fade>
			<UserGuide />
			<CurlDisplay slideIn={showCurl} curl={curl} />
		</>
	);
};
