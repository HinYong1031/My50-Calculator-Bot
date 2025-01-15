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
                expiryDate: expiryEpoch,
                nextPurchaseDate: nextPurchaseEpoch,
                readablePurchaseDate: new Date(
                    purchasedDate.getTime()
                ).toLocaleString(),
                readableExpiryDate: new Date(expiryEpoch).toLocaleString(),
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
            <Typography
                variant="h3"
                className="dark:text-white mb-6 text-center"
            >
                My50 Calculator
            </Typography>

            {/* User Input Section */}
            <div className="flex flex-col items-center gap-6">
                <div className="p-6 border border-gray-300 rounded-lg dark:border-gray-600 shadow-md w-full max-w-4xl">
                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
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
                            className="dark:text-white w-full"
                        />
                        <Input
                            color="blue"
                            label="Mobile Number"
                            value={mobileNum}
                            onChange={(e) => {
                                const value = e.target.value;
                                const regex = /^[0-9]*$/;
                                if (regex.test(value)) {
                                    setMobileNum(value);
                                }
                            }}
                            className="dark:text-white w-full"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-4">
                        <Tooltip
                            content="Get"
                            className="dark:bg-blue-gray-600"
                        >
                            <IconButton
                                variant="text"
                                className="rounded-full hover:bg-blue-gray-50 dark:hover:bg-blue-gray-800 text-blue-gray-600 dark:text-blue-gray-300"
                                onClick={() => fetchUser()}
                            >
                                <CloudArrowDownIcon className="h-6 w-6" />
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
                                <CloudArrowUpIcon className="h-6 w-6" />
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
                                <TrashIcon className="h-6 w-6" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {/* User Existence Message */}
                    {userUsername !== "" && mobileNum !== "" && (
                        <Typography
                            className={`text-sm mt-2 ${
                                userExist ? "text-gray-500" : "text-red-500"
                            }`}
                        >
                            *{" "}
                            {userExist ? "User Exists" : "User Does Not Exist"}
                        </Typography>
                    )}
                </div>
            </div>

            {/* Date Picker Section */}
            <div className="flex flex-col items-center gap-4 mt-10">
                <div className="flex items-center gap-4">
                    <Typography className="font-bold text-lg dark:text-white">
                        Purchased Date:
                    </Typography>
                    <DatePicker
                        dateFormat={"dd-MMM-yyyy"}
                        selected={purchasedDate}
                        onChange={(date) =>
                            setPurchasedDate(date || new Date())
                        }
                        className="border border-gray-500 rounded-lg px-4 py-2 dark:text-white dark:bg-gray-800"
                    />
                </div>
            </div>

            {/* Summary Section */}
            <div className="mt-10 flex justify-center">
                <div className="p-6 border border-gray-300 rounded-lg dark:border-gray-600 shadow-md w-full max-w-4xl">
                    <Typography className="font-bold text-lg lg:text-xl dark:text-white mb-4">
                        Summary
                    </Typography>
                    <div className="grid grid-cols-2 gap-2">
                        <Typography className="text-base dark:text-gray-300">
                            Username:
                        </Typography>
                        <Typography className="text-base dark:text-white">
                            {userUsername || "-"}
                        </Typography>
                        <Typography className="text-base dark:text-gray-300">
                            Purchased Date:
                        </Typography>
                        <Typography className="text-base dark:text-white">
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
                        <Typography className="text-base dark:text-gray-300">
                            Expired Date:
                        </Typography>
                        <Typography className="text-base dark:text-white">
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
                        <Typography className="text-base dark:text-gray-300">
                            You Should Buy On:
                        </Typography>
                        <Typography className="text-base dark:text-white">
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
        </>
    );
}
