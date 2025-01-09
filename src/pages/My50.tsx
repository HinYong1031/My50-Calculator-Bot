import {
    Input,
    IconButton,
    Tooltip,
    Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
    CloudArrowDownIcon,
    CloudArrowUpIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../utils/firebase";
import { get, ref, remove, set } from "firebase/database";
import toast from "react-hot-toast";

type DateType = {
    day:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday";
    date: number;
    month:
        | "Jan"
        | "Feb"
        | "Mar"
        | "Apr"
        | "May"
        | "Jun"
        | "Jul"
        | "Aug"
        | "Sep"
        | "Oct"
        | "Nov"
        | "Dec";
    year: number;
};

// This is a simple tools to calculate My50 expiry date and next purchase date.
// It uses Firebase Realtime Database to store user data.
// It collects Username from the user instead of IC because I'm lazy to do with IC.
// It also collects Mobile Number from the user for alert notification in WhatsApp.

export default function My50() {
    const [userUsername, setUserUsername] = useState("");
    const [mobileNum, setMobileNum] = useState("");
    const [purchasedDate, setPurchasedDate] = useState(new Date());
    const [cusPurchaseDate, setCusPurchaseDate] = useState<DateType>();
    const [cusExpiredDate, setCusExpiredDate] = useState<DateType>();
    const [cusNextPurchaseDate, setCusNextPurchaseDate] = useState<DateType>();
    const [userExist, setUserExist] = useState(false);

    function inputValidation() {
        if (mobileNum === "" || userUsername === "") {
            toast.error("Mobile Number or Username is empty");
            return false;
        }
        return true;
    }

    function fetchUser() {
        if (inputValidation()) {
            get(ref(db, "my50/" + userUsername))
                .then((snapshot) => {
                    const data = snapshot.val();
                    if (data && data.mobileNum === mobileNum) {
                        setPurchasedDate(new Date(data.purchaseDate));
                    } else {
                        toast.error("No Record Found");
                    }
                })
                .catch(() => {
                    toast.error("User Not Found");
                });
        }
    }

    function saveUser() {
        if (inputValidation()) {
            const expiryEpoch = purchasedDate.getTime() + 2505600000; // 29 days
            const nextPurchaseEpoch = expiryEpoch + 86400000; // 1 day after expiry

            set(ref(db, "my50/" + userUsername), {
                mobileNum: mobileNum,
                purchaseDate: purchasedDate.getTime(),
                readableDate: new Date(
                    purchasedDate.getTime()
                ).toLocaleString(),
                expiryDate: expiryEpoch,
                readableExpiryDate: new Date(expiryEpoch).toLocaleString(),
                nextPurchaseDate: nextPurchaseEpoch,
                readableNextPurchaseDate: new Date(
                    nextPurchaseEpoch
                ).toLocaleString(),
            })
                .then(() => {
                    toast.success("User Saved");
                })
                .catch(() => {
                    toast.error("Save Failed");
                });
        }
    }

    function deleteUser() {
        if (inputValidation()) {
            remove(ref(db, "my50/" + userUsername))
                .then(() => {
                    setUserExist(false);
                    toast.success("User Deleted");
                })
                .catch(() => {
                    toast.error("User Not Found");
                });
        }
    }

    function calculateDate() {
        const expiryEpoch = purchasedDate.getTime() + 2505600000; // 29 days
        const nextPurchaseEpoch = expiryEpoch + 86400000; // 1 day after expiry

        setCusPurchaseDate({
            day: purchasedDate.toLocaleDateString("en-US", {
                weekday: "long",
            }) as
                | "Monday"
                | "Tuesday"
                | "Wednesday"
                | "Thursday"
                | "Friday"
                | "Saturday"
                | "Sunday",
            date: purchasedDate.getDate(),
            month: purchasedDate.toLocaleDateString("en-US", {
                month: "short",
            }) as
                | "Jan"
                | "Feb"
                | "Mar"
                | "Apr"
                | "May"
                | "Jun"
                | "Jul"
                | "Aug"
                | "Sep"
                | "Oct"
                | "Nov"
                | "Dec",
            year: purchasedDate.getFullYear(),
        });

        setCusExpiredDate({
            day: new Date(expiryEpoch).toLocaleDateString("en-US", {
                weekday: "long",
            }) as
                | "Monday"
                | "Tuesday"
                | "Wednesday"
                | "Thursday"
                | "Friday"
                | "Saturday"
                | "Sunday",
            date: new Date(expiryEpoch).getDate(),
            month: new Date(expiryEpoch).toLocaleDateString("en-US", {
                month: "short",
            }) as
                | "Jan"
                | "Feb"
                | "Mar"
                | "Apr"
                | "May"
                | "Jun"
                | "Jul"
                | "Aug"
                | "Sep"
                | "Oct"
                | "Nov"
                | "Dec",
            year: new Date(expiryEpoch).getFullYear(),
        });

        setCusNextPurchaseDate({
            day: new Date(nextPurchaseEpoch).toLocaleDateString("en-US", {
                weekday: "long",
            }) as
                | "Monday"
                | "Tuesday"
                | "Wednesday"
                | "Thursday"
                | "Friday"
                | "Saturday"
                | "Sunday",
            date: new Date(nextPurchaseEpoch).getDate(),
            month: new Date(nextPurchaseEpoch).toLocaleDateString("en-US", {
                month: "short",
            }) as
                | "Jan"
                | "Feb"
                | "Mar"
                | "Apr"
                | "May"
                | "Jun"
                | "Jul"
                | "Aug"
                | "Sep"
                | "Oct"
                | "Nov"
                | "Dec",
            year: new Date(nextPurchaseEpoch).getFullYear(),
        });
    }

    useEffect(() => {
        if (mobileNum !== "" && userUsername !== "") {
            // Retrieve username and mobile number
            get(ref(db, "my50/" + userUsername)).then((snapshot) => {
                const data = snapshot.val();
                if (data && data.mobileNum === mobileNum) {
                    setUserExist(true);
                } else {
                    setUserExist(false);
                }
            });
        }
    }, [userUsername, mobileNum]);

    useEffect(() => {
        calculateDate();
    }, [purchasedDate]);

    return (
        <>
            <Typography variant="h3" className="dark:text-white mb-4">
                My50 Calculator
            </Typography>
            <div className="flex justify-center">
                <div>
                    <div className="flex items-center gap-2 justify-center">
                        <div className="lg:w-72 sm:w-60">
                            <Input
                                color="blue"
                                label="Username"
                                value={userUsername}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^[a-zA-Z0-9]*$/;
                                    if (regex.test(value)) {
                                        setUserUsername(value);
                                    }
                                }}
                                className="dark:text-white"
                            />
                        </div>
                        <div className="lg:w-72 sm:w-60">
                            <Input
                                color="blue"
                                label="Mobile Number"
                                value={mobileNum}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // regex to be only start from 0-9
                                    const regex = /^[0-9]*$/;
                                    if (regex.test(value)) {
                                        setMobileNum(value);
                                    }
                                }}
                                className="dark:text-white"
                            />
                        </div>
                        <Tooltip
                            content="Get"
                            className="dark:bg-blue-gray-600"
                        >
                            <IconButton
                                variant="text"
                                className="rounded-full hover:bg-blue-gray-50 dark:hover:bg-blue-gray-800 text-blue-gray-600 dark:text-blue-gray-300"
                                onClick={() => fetchUser()}
                            >
                                <CloudArrowDownIcon className="size-6" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            content="Save"
                            className="dark:bg-blue-gray-600"
                        >
                            <IconButton
                                variant="text"
                                className="rounded-full hover:bg-blue-gray-50 dark:hover:bg-blue-gray-800 text-blue-gray-600 dark:text-blue-gray-300"
                                onClick={() => saveUser()}
                            >
                                <CloudArrowUpIcon className="size-6" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            content="Delete"
                            className="dark:bg-blue-gray-600"
                        >
                            <IconButton
                                variant="text"
                                className="rounded-full hover:bg-blue-gray-50 dark:hover:bg-blue-gray-800 text-blue-gray-600 dark:text-blue-gray-300"
                                onClick={() => deleteUser()}
                            >
                                <TrashIcon className="size-6" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    {userUsername !== "" && mobileNum !== "" &&
                        (userExist ? (
                            <Typography className="text-sm text-gray-500">
                                * User Exists
                            </Typography>
                        ) : (
                            <Typography className="text-sm text-red-500">
                                * User Does Not Exist
                            </Typography>
                        ))
                    }
                </div>
            </div>

            <div className="flex items-center justify-start md:justify-center gap-x-2 py-10">
                <Typography className="font-bold text-base lg:text-2xl dark:text-white">
                    Purchased Date :
                </Typography>
                <DatePicker
                    dateFormat={"dd-MMM-yyyy"}
                    selected={purchasedDate}
                    onChange={(date) => setPurchasedDate(date || new Date())}
                    className="border border-gray-500 rounded-lg w-32 pl-4 lg:pl-24 lg:w-72"
                />
            </div>

            <div className="flex items-center justify-start md:justify-center">
                <div>
                    <Typography className="font-bold text-base lg:text-2xl dark:text-white">
                        Summary
                    </Typography>
                    <div className="flex gap-1">
                        <div>
                            {userUsername && (
                                <Typography className="text-base lg:text-2xl dark:text-white">
                                    Username :
                                </Typography>
                            )}
                            <Typography className="text-base lg:text-2xl dark:text-white">
                                Purchased Date :
                            </Typography>
                            <Typography className="text-base lg:text-2xl dark:text-white">
                                Expired Date :
                            </Typography>
                            <Typography className="text-base lg:text-2xl dark:text-white">
                                You Should Buy On :
                            </Typography>
                        </div>
                        <div>
                            {userUsername && (
                                <Typography className="text-base lg:text-2xl dark:text-white">
                                    {userUsername}
                                </Typography>
                            )}
                            <Typography className="text-base lg:text-2xl dark:text-white">
                                {[
                                    cusPurchaseDate?.day,
                                    `, `,
                                    cusPurchaseDate?.date,
                                    ` `,
                                    cusPurchaseDate?.month,
                                    ` `,
                                    cusPurchaseDate?.year,
                                ]}
                            </Typography>
                            <Typography className="text-base lg:text-2xl dark:text-white">
                                {[
                                    cusExpiredDate?.day,
                                    `, `,
                                    cusExpiredDate?.date,
                                    ` `,
                                    cusExpiredDate?.month,
                                    ` `,
                                    cusExpiredDate?.year,
                                ]}
                            </Typography>
                            <Typography className="text-base lg:text-2xl dark:text-white">
                                {[
                                    cusNextPurchaseDate?.day,
                                    `, `,
                                    cusNextPurchaseDate?.date,
                                    ` `,
                                    cusNextPurchaseDate?.month,
                                    ` `,
                                    cusNextPurchaseDate?.year,
                                ]}
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
